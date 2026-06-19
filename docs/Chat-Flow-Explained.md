# Luồng Chat giữa Candidate và Recruiter — Giải thích chi tiết

> Tài liệu giải thích sâu module chat theo kịch bản cụ thể, từ Frontend → Backend → Database → Realtime.

---

## Mục lục

1. [Database — 2 bảng chính](#1-database--2-bảng-chính)
2. [Kịch bản 1 — Tạo conversation mới](#kịch-bản-1--candidate-a-vào-trang-job-j-và-bấm-liên-hệ)
3. [Kịch bản 2 — Mở trang chat](#kịch-bản-2--mở-trang-candidatechatconversationid50)
4. [Kịch bản 3 — Gửi tin nhắn text](#kịch-bản-3--candidate-gõ-tin-nhắn-và-bấm-gửi)
5. [Kịch bản 4 — Realtime nhận tin](#kịch-bản-4--realtime-recruiter-b-đang-mở-chat-nhận-tin-từ-candidate-a)
6. [Kịch bản 5 — Gửi file đính kèm](#kịch-bản-5--gửi-file-đính-kèm)
7. [Diagram tổng quan](#tổng-kết-luồng-bằng-diagram)
8. [Các điểm cốt lõi](#các-điểm-cốt-lõi-để-nhớ)

---

## Nhân vật trong kịch bản

- **Candidate A**: `userId=10`, `candidateProfileId=5`
- **Recruiter B**: `userId=20`, `recruiterProfileId=8`
- **Job J**: `jobPostingId=100` (do Recruiter B đăng)

---

## 1. Database — 2 bảng chính

### Bảng `conversations`
| Cột | Mô tả |
|-----|-------|
| `id` | PK |
| `candidateProfileId` | FK → candidate_profiles |
| `recruiterProfileId` | FK → recruiter_profiles |
| `jobPostingId` | FK → job_postings (bắt buộc — gắn theo tin tuyển dụng) |
| `createdAt`, `updatedAt` | `updatedAt` cập nhật mỗi khi có message mới → dùng để sort sidebar |

→ 1 conversation = (candidate, recruiter, job) duy nhất. Cùng candidate-recruiter nhưng khác job sẽ tạo conversation khác.

### Bảng `messages`
| Cột | Mô tả |
|-----|-------|
| `id`, `conversationId`, `senderId` | quan hệ cơ bản |
| `content` | text (nullable nếu chỉ gửi file) |
| `messageType` | `'text'` \| `'file'` |
| `attachmentPath` | path trên Supabase Storage bucket `chat-files` |
| `attachmentName`, `attachmentMime`, `attachmentSize` | metadata file |
| `isRead` | trạng thái đã đọc |
| `sentAt` | timestamp |

---

## Kịch bản 1 — Candidate A vào trang job J và bấm "Liên hệ"

### Bước 1: User click nút "Liên hệ nhà tuyển dụng"

Trên trang chi tiết job, có nút gọi:
```typescript
await chatService.createConversation({
  recruiterProfileId: 8,
  jobPostingId: 100
});
```

### Bước 2: Frontend gửi request

**File:** `src/services/chat.service.ts` line 105
```typescript
async createConversation(payload) {
  const res = await post('/chat/conversations', payload);
  return res.data;
}
```
→ Axios gửi `POST /api/chat/conversations` với body `{ recruiterProfileId: 8, jobPostingId: 100 }` + header `Authorization: Bearer <token>`.

### Bước 3: Backend route nhận

**File:** `routes/chat/chat.routes.ts` line 23
```typescript
router.post('/conversations',
  authenticate,                              // (a) check JWT
  validate(createConversationSchema),        // (b) check body có đủ 2 field
  createConversation,                        // (c) controller
);
```

**Chi tiết 3 middleware:**

**(a) `authenticate`** — `middleware/auth.ts`:
- Lấy `Bearer <token>` từ header.
- `jwt.verify(token, JWT_SECRET)` → decode ra `{ id, email, role }`.
- Gán `req.user = { id: 10, email, role: 'candidate' }`.
- Nếu token hỏng/hết hạn → trả 401.

**(b) `validate(createConversationSchema)`** — chạy Zod schema:
```typescript
{ recruiterProfileId: number > 0, jobPostingId: number > 0 }
```
Nếu thiếu/sai kiểu → trả 400 với message rõ ràng.

**(c)** Cả 2 middleware OK → vào controller.

### Bước 4: Controller xử lý

**File:** `controllers/chat/chat.controller.ts` line 57
```typescript
export const createConversation = async (req, res, next) => {
  const user = getCurrentUser(req);          // { id: 10, role: 'candidate' }

  // GUARD 1: Chỉ candidate mới được tạo
  if (user.role !== 'candidate') {
    throw new AppError(403, 'Chỉ ứng viên mới có thể tạo hội thoại');
  }

  // Lấy candidateProfileId từ userId
  const candidateProfileId = await chatService.getCandidateProfileId(user.id);
  // → query: SELECT id FROM candidate_profiles WHERE user_id = 10
  // → trả về 5

  // Gọi service
  const conversation = await chatService.createConversation(
    5,    // candidateProfileId
    8,    // recruiterProfileId (từ body)
    100,  // jobPostingId (từ body)
  );

  return res.status(201).json({ success: true, data: conversation });
};
```

> **Tại sao không lấy `candidateProfileId` từ body?**
> Vì body do client gửi, có thể fake để mạo danh người khác. Lấy từ `user.id` (đã verify qua JWT) → an toàn.

### Bước 5: Service — 5 lớp validation nghiệp vụ

**File:** `services/chat/chat.service.ts` line 182

```typescript
async createConversation(candidateProfileId, recruiterProfileId, jobPostingId) {
```

**Lớp 1 — Có jobPostingId không?**
```typescript
if (!jobPostingId) throw new AppError(400, 'ID tin tuyển dụng là bắt buộc...');
```
→ Hệ thống không cho chat "chung chung", phải gắn theo 1 job cụ thể.

**Lớp 2 — Candidate đã ứng tuyển job này chưa?**
```typescript
const application = await prisma.application.findFirst({
  where: { candidateProfileId: 5, jobPostingId: 100, deletedAt: null },
  include: { jobPosting: { select: { recruiterId: true } } },
});
if (!application) throw new AppError(403, 'Bạn chỉ có thể mở cuộc trò chuyện nếu đã ứng tuyển...');
```

SQL tương đương:
```sql
SELECT a.*, j.recruiter_id
FROM applications a JOIN job_postings j ON a.job_posting_id = j.id
WHERE a.candidate_profile_id = 5 AND a.job_posting_id = 100 AND a.deleted_at IS NULL
LIMIT 1;
```

→ Trả về `application.jobPosting.recruiterId = 20`.

**Mục đích:** Chống spam. Candidate không được chat đại với mọi recruiter, phải apply trước.

**Lớp 3 — Recruiter được chỉ định có đúng là chủ job không?**
```typescript
const recruiterProfile = await prisma.recruiterProfile.findFirst({
  where: {
    id: 8,                                            // recruiterProfileId trong body
    userId: application.jobPosting.recruiterId,       // = 20 (chủ job thật)
  },
});
if (!recruiterProfile) throw new AppError(403, 'Nhà tuyển dụng không khớp...');
```

**Mục đích:** Chống tấn công IDOR (Insecure Direct Object Reference). Nếu kẻ tấn công gửi `recruiterProfileId = 999` (recruiter khác) thì lớp này chặn.

**Lớp 4 — Idempotent check:**
```typescript
const existing = await prisma.conversation.findFirst({
  where: {
    candidateProfileId: 5,
    recruiterProfileId: 8,
    jobPostingId: 100,
  },
  include: { candidateProfile, recruiterProfile, jobPosting },
});
if (existing) return existing;     // ← đã tồn tại → trả về luôn, không tạo mới
```

**Mục đích:** Click 2 lần vào nút "Liên hệ" → không tạo 2 conversation trùng.

**Lớp 5 — Mới thật sự CREATE:**
```typescript
return prisma.conversation.create({
  data: { candidateProfileId: 5, recruiterProfileId: 8, jobPostingId: 100 },
  include: { candidateProfile: {...}, recruiterProfile: {...}, jobPosting: {...} },
});
```

→ SQL: `INSERT INTO conversations (candidate_profile_id, recruiter_profile_id, job_posting_id) VALUES (5, 8, 100) RETURNING *;`

### Bước 6: Trả response về Frontend

```json
{
  "success": true,
  "data": {
    "id": 50,
    "candidateProfileId": 5,
    "recruiterProfileId": 8,
    "jobPostingId": 100,
    "candidateProfile": { "fullName": "Nguyễn Văn A", "avatarUrl": null },
    "recruiterProfile": { "companyName": "HireArch", "logoUrl": "...", "contactName": "B" },
    "jobPosting": { "title": "React Developer" },
    "createdAt": "2026-06-20T10:00:00Z",
    "updatedAt": "2026-06-20T10:00:00Z"
  }
}
```

Frontend redirect sang `/candidate/chat?conversationId=50`.

---

## Kịch bản 2 — Mở trang `/candidate/chat?conversationId=50`

### Bước 7: Component `Chat.tsx` mount

**File:** `pages/candidate/Chat.tsx` line 919

#### 7.1 — Đọc URL param (line 921–928)
```typescript
const [searchParams] = useSearchParams();
const requestedConversationId = Number(searchParams.get("conversationId"));
// → 50
```

#### 7.2 — useEffect chạy `loadConversations(true)` (line 1045)
```typescript
useEffect(() => {
  loadConversations(true);
}, [loadConversations]);
```

#### 7.3 — `loadConversations` (line 980)
```typescript
const loadConversations = useCallback(async (selectFirst = false) => {
  setIsLoadingConversations(true);
  const data = await chatService.getConversations();   // ← GET /chat/conversations
  setConversations(data);

  // Nếu URL có ?conversationId=50 → chọn cái đó
  const requestedConversation = data.find(c => c.id === 50);
  if (requestedConversation) {
    setActiveConversationId(50);
    return;
  }
  // Không có thì chọn cái đầu sidebar
  if (selectFirst && data.length > 0) {
    setActiveConversationId(curr => curr ?? data[0].id);
  }
}, [requestedConversationId]);
```

#### 7.4 — Backend xử lý `GET /chat/conversations`

**Controller:** `chat.controller.ts` line 47
```typescript
const conversations = await chatService.findConversations(user.id, user.role);
return res.json({ success: true, data: conversations });
```

**Service:** `chat.service.ts` line 109
```typescript
async findConversations(userId, role) {
  // Filter theo profile của user
  const where = await getUserConversationWhere(userId, role);
  // → { candidateProfileId: 5 } cho candidate
  // → { recruiterProfileId: 8 } cho recruiter

  const conversations = await prisma.conversation.findMany({
    where: { candidateProfileId: 5 },
    include: {
      candidateProfile: { select: { fullName, avatarUrl } },
      recruiterProfile: { select: { companyName, logoUrl, contactName } },
      jobPosting: { select: { title } },
      messages: { take: 1, orderBy: { sentAt: 'desc' } },   // ← tin cuối cho preview
      _count: {
        select: {
          messages: { where: { isRead: false, senderId: { not: 10 } } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return conversations;
}
```

**Tương đương SQL** (đơn giản hóa):
```sql
SELECT c.*,
       cp.full_name, cp.avatar_url,
       rp.company_name, rp.logo_url, rp.contact_name,
       j.title,
       (SELECT * FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) AS last_message,
       (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id
        AND is_read = false AND sender_id != 10) AS unread_count
FROM conversations c
JOIN candidate_profiles cp ON c.candidate_profile_id = cp.id
JOIN recruiter_profiles rp ON c.recruiter_profile_id = rp.id
LEFT JOIN job_postings j ON c.job_posting_id = j.id
WHERE c.candidate_profile_id = 5
ORDER BY c.updated_at DESC;
```

→ Trả về mảng conversations. Mỗi item có sẵn:
- Thông tin để render sidebar (avatar, tên).
- 1 tin nhắn cuối (preview).
- Số tin chưa đọc (badge).

#### 7.5 — Frontend nhận về, set state
```typescript
setConversations(data);
setActiveConversationId(50);
```

#### 7.6 — `useEffect` thứ 2 trigger vì `activeConversationId` đổi (line 1050)
```typescript
useEffect(() => {
  if (activeConversationId) loadMessages(activeConversationId);
}, [activeConversationId, loadMessages]);
```

#### 7.7 — `loadMessages(50)` (line 1014)
```typescript
const loadMessages = useCallback(async (conversationId) => {
  setIsLoadingMessages(true);
  const response = await chatService.getMessages(50, 1, 100);
  setMessages(normalizeMessages(response.items));

  // Auto mark-as-read các tin của recruiter mà mình chưa đọc
  const unreadMessages = response.items.filter(
    m => !m.isRead && m.senderId !== user?.id
  );
  if (unreadMessages.length > 0) {
    await Promise.all(unreadMessages.map(m => chatService.markMessageRead(m.id)));
    loadConversations();   // refresh sidebar (badge unread = 0)
  }
}, [loadConversations, user?.id]);
```

→ `GET /chat/conversations/50/messages?page=1&limit=100`.

#### 7.8 — Backend `findMessages` (line 248)
```typescript
async findMessages(conversationId: 50, userId: 10, role: 'candidate', { page: 1, limit: 100 }) {
  // GUARD: check user có phải member của conversation này không
  await findConversationForUser(50, 10, 'candidate');
  // → SELECT * FROM conversations WHERE id = 50 AND candidate_profile_id = 5
  // → Nếu kẻ tấn công đoán conversationId = 999 (không phải của họ) → 403

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId: 50 },
      include: { sender: { select: { id, role } } },
      orderBy: { sentAt: 'asc' },          // CŨ → MỚI (chat đọc từ trên xuống)
      skip: 0,
      take: 100,
    }),
    prisma.message.count({ where: { conversationId: 50 } }),
  ]);

  // Sinh signed URL cho mỗi file đính kèm
  const mappedMessages = await Promise.all(
    messages.map(async (msg) => {
      if (msg.messageType === 'file' && msg.attachmentPath) {
        msg.attachmentUrl = await storageService.createSignedUrl(
          msg.attachmentPath,
          'chat-files',
          600,    // ← URL có hiệu lực 10 phút
        );
      }
      return msg;
    }),
  );

  return { items: mappedMessages, meta: {...} };
}
```

**Vì sao Signed URL?**
- Bucket `chat-files` trên Supabase là **PRIVATE** → không thể download file qua URL công khai.
- Backend sinh URL có chữ ký HMAC chứa `expiry_timestamp` → Supabase Storage verify chữ ký + thời gian → cho download.
- Sau 10 phút URL hết hạn → cần re-fetch messages để có URL mới.

#### 7.9 — Frontend nhận về 100 messages, render

```typescript
setMessages(normalizeMessages(response.items));
// normalizeMessages:
//   - decode mojibake tên file (tiếng Việt bị lỗi encoding)
//   - sort theo sentAt ASC, tie-break theo id ASC
```

Mỗi message render trong khung chat: bên trái nếu `senderId !== user.id`, bên phải nếu `senderId === user.id`.

#### 7.10 — Auto-scroll xuống cuối (line 1147)
```typescript
useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
```

→ Component có 1 div `<div ref={chatEndRef} />` ở cuối list. Mỗi khi `messages` thay đổi → scroll xuống đó.

---

## Kịch bản 3 — Candidate gõ tin nhắn và bấm gửi

### Bước 8: User nhập "Chào anh, em muốn hỏi về..." → bấm Enter

```typescript
<form onSubmit={handleSendMessage}>
  <input value={inputMessage} onChange={e => setInputMessage(e.target.value)} />
</form>
```

### Bước 9: `handleSendMessage` chạy (line 1158)

```typescript
const handleSendMessage = async (event) => {
  event.preventDefault();
  if (!inputMessage.trim() || !activeConversationId || !user?.id) return;

  const textToSend = inputMessage.trim();   // "Chào anh, em muốn hỏi về..."
  const optimisticId = -Date.now();         // ví dụ: -1718780400000

  setInputMessage("");                       // Clear input ngay
```

### Bước 10: Optimistic UI — Append message tạm

```typescript
  setMessages((current) => [
    ...current,
    createOptimisticTextMessage({
      id: optimisticId,                    // -1718780400000 (ID âm)
      conversationId: 50,
      senderId: 10,
      content: textToSend,
    }),
  ]);
```

→ Message tạm xuất hiện **NGAY LẬP TỨC** trên màn hình, không cần đợi server.

Shape của message tạm:
```typescript
{
  id: -1718780400000,
  conversationId: 50,
  senderId: 10,
  content: "Chào anh, em muốn hỏi về...",
  messageType: 'text',
  isRead: false,
  sentAt: new Date().toISOString(),
  sender: { id: 10, role: 'candidate' },
  deliveryStatus: 'sending',              // ← key state đặc biệt
}
```

UI render: hiển thị icon đồng hồ/loading bên cạnh message → user biết đang gửi.

**Tại sao dùng ID âm?**
- ID thật từ Postgres luôn dương (auto-increment).
- ID âm tạm tránh va chạm khi DB trả về ID thật.
- Khi response về → dùng `optimisticId` để tìm và thay thế.

### Bước 11: Gọi API thật

```typescript
  try {
    const sentMessage = await chatService.sendMessage(50, textToSend);
    // → POST /chat/conversations/50/messages { content: "..." }
```

### Bước 12: Backend `createMessage` (line 293)

```typescript
async createMessage(conversationId: 50, senderId: 10, role: 'candidate', content: "...") {
  // GUARD: check member
  await findConversationForUser(50, 10, 'candidate');

  // INSERT message
  const message = await prisma.message.create({
    data: { conversationId: 50, senderId: 10, content: "Chào anh..." },
    include: { sender: { select: { id, role } } },
  });
  // → INSERT INTO messages (...) VALUES (...) RETURNING *
  // → message.id = 1234 (số dương thật từ DB)

  // BUMP updatedAt để conversation lên đầu sidebar
  await prisma.conversation.update({
    where: { id: 50 },
    data: { updatedAt: new Date() },
  });

  // Tạo notification cho người còn lại
  await createMessageNotification(50, 10);

  return message;
}
```

### Bước 13: `createMessageNotification` (line 80)

```typescript
const createMessageNotification = async (conversationId: 50, senderId: 10) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: 50 },
    include: {
      candidateProfile: { select: { userId: true } },     // userId = 10
      recruiterProfile: { select: { userId: true } },     // userId = 20
    },
  });

  // Xác định receiver: không phải sender thì là receiver
  const receiverId = conversation.candidateProfile.userId === senderId
    ? conversation.recruiterProfile.userId    // sender là candidate → receiver = recruiter
    : conversation.candidateProfile.userId;
  // → receiverId = 20 (Recruiter B)

  await prisma.notification.create({
    data: {
      userId: 20,
      type: 'new_message',
      title: 'Tin nhắn mới',
      message: 'Bạn có một tin nhắn mới',
      relatedType: 'conversation',
      relatedId: 50,
    },
  });
};
```

→ Recruiter B sẽ thấy thông báo (chuông) khi vào app.

### Bước 14: Backend trả response

```json
{
  "success": true,
  "data": {
    "id": 1234,
    "conversationId": 50,
    "senderId": 10,
    "content": "Chào anh, em muốn hỏi về...",
    "messageType": "text",
    "isRead": false,
    "sentAt": "2026-06-20T10:05:00Z",
    "sender": { "id": 10, "role": "candidate" }
  }
}
```

### Bước 15: Frontend thay message tạm bằng message thật

```typescript
    setMessages((current) =>
      current.map((message) =>
        message.id === optimisticId            // -1718780400000
          ? normalizeMessage(sentMessage)      // ← thay bằng message từ server (id = 1234)
          : message
      )
    );
    loadConversations();   // Refresh sidebar (cập nhật preview tin cuối)
  } catch (error) {
    // Thất bại → đánh dấu error
    setMessages((current) =>
      current.map((message) =>
        message.id === optimisticId
          ? { ...message, deliveryStatus: "error" }
          : message
      )
    );
  }
};
```

**Nếu lỗi**: message tạm vẫn còn nhưng có flag `deliveryStatus: 'error'` → UI render dấu chấm than đỏ + nút "Gửi lại". Click vào → `handleRetryMessage` (line 1209).

---

## Kịch bản 4 — Realtime: Recruiter B đang mở chat, nhận tin từ Candidate A

### Bước 16: Recruiter B đã subscribe channel từ trước

Khi Recruiter B mở conversation 50, `useEffect` ở line 1064 chạy:

```typescript
useEffect(() => {
  if (!activeConversationId || !client) return;

  const channel = supabase
    .channel(`conversation-50`)                    // tên channel unique theo conversation
    .on('postgres_changes', {
      event: 'INSERT',                             // chỉ nhận event INSERT
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.50`,             // chỉ tin nhắn của conversation này
    }, async (payload) => {
      // Handler chạy khi có tin nhắn mới
      ...
    })
    .on('postgres_changes', {
      event: 'UPDATE',                             // và event UPDATE (cho isRead)
      ...
    }, async () => { ... })
    .subscribe();

  return () => { client.removeChannel(channel); };
}, [activeConversationId, ...]);
```

### Bước 17: Supabase Realtime cơ chế

Supabase = PostgreSQL + service Realtime. Khi enable replication cho bảng `messages`:

```
1. Postgres ghi INSERT vào WAL (Write-Ahead Log)
2. Supabase Realtime service đọc WAL qua "logical replication slot"
3. Match filter (conversation_id = 50) cho từng subscriber
4. Push qua WebSocket đến client
```

Khi Bước 12 INSERT message id=1234 vào DB:
- WAL ghi: `INSERT INTO messages (id=1234, conversation_id=50, sender_id=10, content='Chào anh...')`
- Realtime service: "Có subscriber filter conversation_id=eq.50 → push event"
- Client Recruiter B nhận WebSocket payload:
  ```json
  {
    "eventType": "INSERT",
    "new": { "id": 1234, "conversation_id": 50, "sender_id": 10, "content": "...", ... }
  }
  ```

### Bước 18: Handler INSERT chạy trên máy Recruiter (line 1078)

```typescript
async (payload) => {
  const newMessage = payload.new as { sender_id?: number };

  // (a) Bỏ qua nếu tin do CHÍNH MÌNH gửi (đã xử lý qua optimistic UI)
  if (newMessage.sender_id === user?.id) return;
  // Recruiter B có user.id = 20, sender_id = 10 → KHÔNG return

  try {
    // (b) Re-fetch toàn bộ messages
    const response = await chatService.getMessages(50, 1, 100);
    setMessages(normalizeMessages(response.items));

    // (c) Auto mark-as-read các tin chưa đọc
    const unreadNewMessages = response.items.filter(
      m => !m.isRead && m.senderId !== user?.id
    );
    if (unreadNewMessages.length > 0) {
      await Promise.all(
        unreadNewMessages.map(m => chatService.markMessageRead(m.id))
      );
    }

    // (d) Reload sidebar
    loadConversations();
  } catch (error) { ... }
}
```

**Vì sao re-fetch toàn bộ thay vì append `payload.new`?**

1. **Payload từ Realtime là snake_case** (`sender_id`, `sent_at`) còn type FE là camelCase (`senderId`, `sentAt`) → phải map.
2. **Payload không có `sender` object** (`{ id, role }`) — Realtime chỉ trả raw row, không có JOIN.
3. **Nếu là file message → không có `attachmentUrl`** (signed URL). Re-fetch để BE sinh URL mới.
4. **Đơn giản hóa code** — chỉ 1 path cập nhật state thay vì 2 (initial load + realtime patch).

Trade-off: 1 round-trip thêm, nhưng đơn giản và đúng đắn.

### Bước 19: Mark as read tự động

Khi `markMessageRead(1234)` chạy:
```
PUT /chat/messages/1234/read
→ UPDATE messages SET is_read = true WHERE id = 1234
```

Update này lại tạo ra một **Realtime UPDATE event** → Candidate A (đang mở conversation) sẽ nhận event UPDATE, re-fetch messages → thấy tin của mình đã chuyển trạng thái `isRead: true` → UI hiển thị "Đã xem" (double check mark).

→ Đó là lý do code có thêm listener UPDATE ở line 1113.

### Bước 20: Cleanup khi rời conversation

```typescript
return () => { client.removeChannel(channel); };
```

Khi user chuyển sang conversation khác hoặc rời trang → unsubscribe channel → tránh leak WebSocket connection và tránh nhận event của conversation cũ.

---

## Kịch bản 5 — Gửi file đính kèm

### Bước 21: User chọn file PDF từ input

```typescript
<input type="file" onChange={handleFileSelect} />
```

### Bước 22: Frontend tạo FormData

```typescript
const formData = new FormData();
formData.append('file', selectedFile);     // ← binary
formData.append('content', "Đây là CV của em");   // optional text kèm
// → POST /chat/conversations/50/attachments
```

### Bước 23: Backend route + multer middleware

**Route:**
```typescript
router.post('/conversations/:id/attachments',
  authenticate,
  upload.single('file'),    // ← multer parse multipart/form-data
  uploadAttachment,
);
```

Multer parse file vào `req.file`:
```typescript
req.file = {
  originalname: "CV_Nguyen_A.pdf",
  mimetype: "application/pdf",
  size: 154832,
  buffer: <Buffer ...>,
}
```

### Bước 24: Controller (line 124)
```typescript
if (!req.file) throw new AppError(400, 'Vui lòng chọn file đính kèm');
const message = await chatService.createMessageWithAttachment(
  50, user.id, user.role, req.file, req.body.content
);
return res.status(201).json({ success: true, data: message });
```

### Bước 25: Service `createMessageWithAttachment` (line 311)

```typescript
async createMessageWithAttachment(conversationId, senderId, role, file, content) {
  await findConversationForUser(50, 10, 'candidate');

  // (1) UPLOAD file lên Supabase Storage trước
  const uploadResult = await storageService.uploadFile(file, 'chat-files');
  // → uploadResult.storagePath = "conv-50/1718780500-CV.pdf"

  let message;
  try {
    // (2) DB transaction: insert message + bump conversation
    message = await prisma.$transaction(async (tx) => {
      const createdMessage = await tx.message.create({
        data: {
          conversationId: 50,
          senderId: 10,
          content: "Đây là CV của em",
          messageType: 'file',
          attachmentPath: uploadResult.storagePath,
          attachmentName: normalizeUploadedFileName("CV_Nguyen_A.pdf"),
          attachmentMime: "application/pdf",
          attachmentSize: 154832,
        },
        include: { sender: ... },
      });
      await tx.conversation.update({ where: { id: 50 }, data: { updatedAt: new Date() } });
      return createdMessage;
    });
  } catch (err) {
    // (3) COMPENSATING TRANSACTION: nếu DB lỗi → xóa file đã upload
    await storageService.deleteFile(uploadResult.storagePath, 'chat-files');
    throw err;
  }

  // (4) Notification
  await createMessageNotification(50, 10);

  // (5) Sinh signed URL ngay → FE preview/download liền không cần re-fetch
  const signedUrl = await storageService.createSignedUrl(
    uploadResult.storagePath, 'chat-files', 600
  );
  message.attachmentUrl = signedUrl;

  return message;
}
```

**Pattern quan trọng — Compensating Transaction:**

Vì Storage và Database là **2 hệ thống tách biệt**, không có cách nào transaction nguyên tử cả hai. Nên:
- **Cách sai**: INSERT DB trước → upload Storage → nếu upload fail → DB có row trỏ tới file không tồn tại (broken).
- **Cách đúng (code đang làm)**: Upload Storage trước → INSERT DB → nếu INSERT fail → **xóa file Storage** (rollback thủ công). Cuối cùng nếu cả 2 thành công → OK.

Trường hợp xấu nhất còn lại: file đã upload, DB đã insert, nhưng `storageService.deleteFile` lỗi (rất hiếm) → orphan file. Cần job cron quét định kỳ để dọn.

---

## Tổng kết luồng bằng diagram

```
┌────────────────────┐                                ┌────────────────────┐
│  Candidate A       │                                │  Recruiter B       │
│  Browser           │                                │  Browser           │
└──────────┬─────────┘                                └─────────┬──────────┘
           │                                                    │
           │ 1. POST /chat/conversations                        │
           │    { recruiterProfileId, jobPostingId }            │
           ▼                                                    │
   ┌────────────────────────────────────────────────┐           │
   │  Backend: createConversation                   │           │
   │  - authenticate (JWT)                          │           │
   │  - validate body                               │           │
   │  - Check candidate đã apply job                │           │
   │  - Check recruiter là chủ job                  │           │
   │  - Idempotent (đã tồn tại → trả lại)           │           │
   │  - INSERT conversations                        │           │
   └─────────────────┬──────────────────────────────┘           │
           ◄─────────┘ { id: 50, ... }                          │
           │                                                    │
           │ 2. Vào /candidate/chat?conversationId=50           │
           │    → loadConversations() → loadMessages(50)        │
           │                                                    │
           │ 3. Subscribe Supabase channel "conversation-50"    │
           │◄────────────────────────────────────────────────────┐
           │                                                    │
           │ 4. Gõ "Chào anh..." → handleSendMessage            │
           │  - Optimistic UI: append message id=-X (sending)   │
           │  - POST /chat/conversations/50/messages            │
           ▼                                                    │
   ┌────────────────────────────────────────────────┐           │
   │  Backend: createMessage                        │           │
   │  - findConversationForUser (guard)             │           │
   │  - INSERT messages → id=1234                   │           │
   │  - UPDATE conversations.updatedAt              │           │
   │  - INSERT notification (cho recruiter)         │           │
   └─────────────┬───────────┬──────────────────────┘           │
                 │           │ Postgres WAL                     │
                 │           ▼                                  │
                 │   ┌────────────────────────┐                 │
                 │   │ Supabase Realtime      │                 │
                 │   │ - Đọc WAL              │                 │
                 │   │ - Match filter         │ ─── WebSocket ──▶
                 │   │ - Broadcast            │  INSERT payload │
                 │   └────────────────────────┘                 │
                 │                                              │
                 ◄─── { id:1234, sentAt, ... }                  │
           │                                                    │
           │ 5. Thay message id=-X bằng id=1234                 │
           │    loadConversations() refresh sidebar             │
           │                                                    │
           │                          6. Handler INSERT chạy:   │
           │                          - Bỏ qua nếu sender = mình│
           │                          - getMessages(50,1,100)   │
           │                          - markMessageRead cho tin │
           │                            của candidate           │
           │                          - loadConversations()     │
           │                                                    │
           │                                              ┌─────▼─────┐
           │                                              │ Backend   │
           │                                              │ markAsRead│
           │                                              │ UPDATE    │
           │                                              │ messages  │
           │                                              │ isRead=true
           │                                              └─────┬─────┘
           │                                                    │
           │                                          Postgres WAL
           │◄──── UPDATE event broadcast qua Realtime ──────────┤
           │                                                    │
           │ 7. Handler UPDATE chạy:                            │
           │    - Re-fetch messages                             │
           │    - Thấy tin của mình isRead=true                 │
           │    - UI hiển thị "Đã xem"                          │
           │                                                    │
```

---

## Các điểm cốt lõi để nhớ

1. **Authorization layered**: middleware authenticate → controller check role → service check ownership (`findConversationForUser`). Không tin tưởng client ở bất kỳ tầng nào.

2. **Idempotent createConversation**: tránh tạo trùng khi user spam click.

3. **3 lớp validation nghiệp vụ** khi tạo conversation: có job → đã apply → recruiter đúng chủ.

4. **Optimistic UI** với ID âm: UX nhanh, không lo collision.

5. **Realtime qua Postgres WAL → Supabase → WebSocket**: không cần code server WebSocket riêng, Supabase đã handle.

6. **Re-fetch thay vì patch payload** từ Realtime: đơn giản + đúng (có signed URL, có sender info).

7. **Auto mark-as-read** khi message đến trong conversation đang mở: tránh user phải bấm tay.

8. **Signed URL 10 phút** cho file: bảo mật bucket private + tiết kiệm bandwidth BE.

9. **Compensating transaction** khi upload file: upload → DB → rollback file nếu DB fail.

10. **Bump `updatedAt` mỗi message** → sidebar luôn sort đúng theo "tin mới nhất".

---

## Sự khác nhau giữa Candidate và Recruiter UI

| Khía cạnh | Candidate | Recruiter |
|-----------|-----------|-----------|
| Tạo conversation | ✅ (POST /conversations) | ❌ chỉ nhận chat |
| Quyền `findConversationApplications` | ❌ | ✅ (xem CV ứng viên trong chat) |
| Sidebar info | Hiển thị công ty + tên người liên hệ | Hiển thị tên ứng viên + avatar |
| Right panel | Không có | Có panel "Hồ sơ ứng tuyển" hiện CV, feedback, evaluation |

→ Logic backend đã handle sẵn (`if role !== 'recruiter' return`), 2 trang FE chỉ render khác nhau.

---

## Các file quan trọng

### Frontend (`D:\LTWeb\LTWeb-frontend`)
| File | Vai trò |
|------|---------|
| `src/pages/candidate/Chat.tsx` | Trang chat của ứng viên |
| `src/pages/recruiter/Chat.tsx` | Trang chat của nhà tuyển dụng |
| `src/services/chat.service.ts` | API client wrapper cho chat |
| `src/utils/supabase.ts` | Supabase client (Auth + Realtime) |

### Backend (`D:\LTWeb\LTWeb-backend`)
| File | Vai trò |
|------|---------|
| `src/routes/chat/chat.routes.ts` | Route definitions |
| `src/controllers/chat/chat.controller.ts` | Request handlers |
| `src/services/chat/chat.service.ts` | Business logic chính |
| `src/services/storage/storage.service.ts` | Upload/Signed URL cho Supabase Storage |
| `src/validations/chat/chat.validation.ts` | Zod schemas |
| `src/middleware/upload.ts` | Multer config |

---

## Điểm có thể cải thiện (nếu scale lớn hơn)

1. **Re-fetch toàn bộ 100 messages mỗi event Realtime** → tốn bandwidth khi conversation lớn. Có thể chỉ fetch message với `id > lastSeenId`.
2. **Không có typing indicator** — Supabase Realtime hỗ trợ `presence` channel làm việc này.
3. **Pagination messages** — code có support `page/limit` nhưng FE luôn lấy 100 đầu, chưa có infinite scroll lên trên.
4. **Polling `loadConversations` sau mỗi action** — có thể dùng Realtime channel cho bảng `conversations` để tự cập nhật, ít gọi API hơn.
5. **Không có Read receipt tinh tế** — chỉ có `isRead` boolean, không có "delivered" vs "seen" timestamp.
