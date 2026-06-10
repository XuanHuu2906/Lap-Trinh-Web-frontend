# Hướng dẫn setup UC-21: Chat với nhà tuyển dụng

Dự án hiện tại:

```txt
React + ExpressJS + PostgreSQL + Supabase
```

Mục tiêu của UC-21:

- Ứng viên và nhà tuyển dụng có thể nhắn tin với nhau.
- Chỉ mở chat khi ứng viên đã ứng tuyển vào tin tuyển dụng.
- Tin nhắn được lưu vào database.
- Giao diện chat cập nhật realtime.
- Có thể đính kèm file như CV, tài liệu.
- Bên nhận có thông báo khi có tin nhắn mới.

---

## 1. Phương án công nghệ nên dùng

Vì dự án đã dùng Supabase, không nên thêm Firebase nữa.

Nên dùng:

```txt
React
+ ExpressJS
+ PostgreSQL trên Supabase
+ Supabase Realtime
+ Supabase Storage
```

Vai trò từng phần:

| Thành phần | Nhiệm vụ |
|---|---|
| React | Hiển thị giao diện chat, danh sách hội thoại, nghe realtime |
| ExpressJS | Kiểm tra quyền chat, lưu tin nhắn, tạo thông báo |
| PostgreSQL/Supabase | Lưu hội thoại, tin nhắn, thông báo |
| Supabase Realtime | Đẩy tin nhắn mới lên giao diện theo thời gian thực |
| Supabase Storage | Lưu file đính kèm trong chat |

Luồng tổng quát:

```txt
Người dùng gửi tin nhắn
→ React gọi API ExpressJS
→ ExpressJS kiểm tra quyền
→ ExpressJS lưu message vào PostgreSQL/Supabase
→ Supabase Realtime phát hiện dòng mới trong bảng messages
→ React của người nhận nhận được message mới
```

---

## 2. Cài thư viện

### 2.1. Frontend React

```bash
npm install @supabase/supabase-js
```

### 2.2. Backend ExpressJS

```bash
npm install @supabase/supabase-js
```

Nếu backend chưa có `dotenv`:

```bash
npm install dotenv
```

---

## 3. Lấy thông tin Supabase

Vào Supabase Dashboard:

```txt
Project Settings
→ API Keys
```

Cần lấy:

```txt
SUPABASE_URL
SUPABASE_ANON_KEY hoặc publishable key
SUPABASE_SERVICE_ROLE_KEY hoặc secret key
```

Lưu ý quan trọng:

```txt
SUPABASE_ANON_KEY / publishable key:
- Được dùng ở frontend React.

SUPABASE_SERVICE_ROLE_KEY / secret key:
- Chỉ dùng ở backend ExpressJS.
- Không bao giờ đưa vào frontend.
```

---

## 4. Tạo biến môi trường

### 4.1. Backend `.env`

Ví dụ:

```env
PORT=5000

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4.2. Frontend `.env`

Nếu dùng Vite React:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

---

## 5. Tạo Supabase client

### 5.1. Backend: `src/config/supabase.js`

```js
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

Backend dùng `supabaseAdmin` để:

- Kiểm tra ứng viên đã ứng tuyển chưa.
- Tạo hội thoại.
- Lưu tin nhắn.
- Tạo thông báo.

---

### 5.2. Frontend: `src/lib/supabase.js`

```js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

Frontend dùng client này để:

- Nghe realtime tin nhắn.
- Nghe realtime thông báo.
- Upload file lên Supabase Storage.

---

## 6. Thiết kế database

> Lưu ý: Nếu bảng `users`, `jobs`, `applications` của bạn đang dùng kiểu `integer` thay vì `uuid`, hãy đổi các cột `user_id`, `job_id`, `application_id` bên dưới thành `integer`.

Chạy trong Supabase:

```txt
Supabase Dashboard
→ SQL Editor
→ New Query
```

### 6.1. Bảng `conversations`

Bảng này lưu một cuộc hội thoại giữa ứng viên và nhà tuyển dụng.

```sql
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null,
  job_id uuid not null,

  candidate_id uuid not null,
  recruiter_id uuid not null,

  last_message text,
  last_message_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint conversations_application_unique unique (application_id)
);
```

Ý nghĩa:

| Cột | Ý nghĩa |
|---|---|
| `application_id` | Đơn ứng tuyển liên quan đến cuộc chat |
| `job_id` | Tin tuyển dụng liên quan |
| `candidate_id` | Ứng viên |
| `recruiter_id` | Nhà tuyển dụng |
| `last_message` | Tin nhắn cuối cùng để hiển thị ở danh sách chat |
| `last_message_at` | Thời điểm tin nhắn cuối |

Vì UC của bạn nói chỉ mở chat khi ứng viên đã ứng tuyển, nên nên gắn chat với `application_id`.

---

### 6.2. Bảng `messages`

Bảng này lưu từng tin nhắn.

```sql
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),

  conversation_id uuid not null references conversations(id) on delete cascade,

  sender_id uuid not null,
  receiver_id uuid not null,

  message_type text not null default 'TEXT'
    check (message_type in ('TEXT', 'FILE')),

  content text,

  file_url text,
  file_name text,
  file_size integer,

  is_read boolean default false,

  created_at timestamptz default now()
);
```

Ý nghĩa:

| Cột | Ý nghĩa |
|---|---|
| `conversation_id` | Tin nhắn thuộc hội thoại nào |
| `sender_id` | Người gửi |
| `receiver_id` | Người nhận |
| `message_type` | `TEXT` hoặc `FILE` |
| `content` | Nội dung tin nhắn |
| `file_url` | Link file nếu có |
| `file_name` | Tên file nếu có |
| `is_read` | Đã đọc hay chưa |

---

### 6.3. Bảng `notifications`

Bảng này lưu thông báo trong hệ thống.

```sql
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null,

  type text not null,
  title text not null,
  content text,

  conversation_id uuid references conversations(id) on delete cascade,

  is_read boolean default false,

  created_at timestamptz default now()
);
```

Ví dụ notification:

```txt
Bạn có tin nhắn mới từ Nguyễn Văn A
```

---

### 6.4. Index nên có

```sql
create index if not exists idx_conversations_candidate
on conversations(candidate_id);

create index if not exists idx_conversations_recruiter
on conversations(recruiter_id);

create index if not exists idx_messages_conversation_created
on messages(conversation_id, created_at);

create index if not exists idx_notifications_user_created
on notifications(user_id, created_at);
```

Index giúp truy vấn nhanh hơn khi:

- Lấy danh sách hội thoại của một user.
- Lấy lịch sử tin nhắn trong một hội thoại.
- Lấy thông báo của một user.

---

## 7. Bật Supabase Realtime

Cần bật realtime cho bảng:

```txt
messages
notifications
```

### Cách 1: Bật trong Dashboard

Vào:

```txt
Supabase Dashboard
→ Database
→ Publications
→ supabase_realtime
→ bật bảng messages
→ bật bảng notifications
```

### Cách 2: Chạy SQL

```sql
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
```

Nếu SQL báo bảng đã được add rồi thì có thể bỏ qua.

---

## 8. Tạo bucket Supabase Storage

Vào:

```txt
Supabase Dashboard
→ Storage
→ New bucket
```

Tạo bucket:

```txt
chat-files
```

Đối với đồ án, có thể để bucket public cho dễ demo.

```txt
Bucket name: chat-files
Public bucket: bật
```

Nếu làm thực tế, nên để private bucket và dùng signed URL.

---

## 9. Cấu trúc thư mục gợi ý

### 9.1. Backend ExpressJS

```txt
backend/
├── src/
│   ├── config/
│   │   └── supabase.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   └── chat.routes.js
│   ├── controllers/
│   │   └── chat.controller.js
│   └── app.js
└── .env
```

### 9.2. Frontend React

```txt
frontend/
├── src/
│   ├── lib/
│   │   └── supabase.js
│   ├── api/
│   │   └── chatApi.js
│   ├── hooks/
│   │   ├── useMessagesRealtime.js
│   │   └── useNotificationsRealtime.js
│   ├── pages/
│   │   └── ChatPage.jsx
│   └── components/
│       ├── ConversationList.jsx
│       ├── ChatBox.jsx
│       └── MessageInput.jsx
└── .env
```

---

## 10. Backend: middleware lấy user đang đăng nhập

Ví dụ `src/middleware/authMiddleware.js`:

```js
export function authMiddleware(req, res, next) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Bạn chưa đăng nhập.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token không hợp lệ.",
    });
  }
}
```

Trong dự án thật, `req.user` thường được lấy từ JWT sau khi verify token.

Ví dụ sau khi verify token, `req.user` có dạng:

```js
req.user = {
  id: "user-id",
  role: "CANDIDATE"
};
```

---

## 11. Backend: routes chat

Tạo file `src/routes/chat.routes.js`:

```js
import express from "express";
import {
  getConversations,
  openConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
} from "../controllers/chat.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/conversations", getConversations);
router.post("/conversations", openConversation);
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/conversations/:conversationId/messages", sendMessage);
router.patch("/conversations/:conversationId/read", markMessagesAsRead);

export default router;
```

Gắn route vào `app.js`:

```js
import express from "express";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

app.use(express.json());

app.use("/api/chat", chatRoutes);

export default app;
```

---

## 12. Backend: controller chat

Tạo file `src/controllers/chat.controller.js`.

### 12.1. Lấy danh sách hội thoại

```js
import { supabaseAdmin } from "../config/supabase.js";

export async function getConversations(req, res) {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .or(`candidate_id.eq.${userId},recruiter_id.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi lấy danh sách hội thoại.",
      error: error.message,
    });
  }
}
```

---

### 12.2. Mở hoặc tạo hội thoại

Frontend gửi lên:

```json
{
  "applicationId": "application-id"
}
```

Backend sẽ kiểm tra:

```txt
User hiện tại có phải ứng viên của đơn ứng tuyển này không?
Hoặc user hiện tại có phải nhà tuyển dụng sở hữu job này không?
```

Code:

```js
export async function openConversation(req, res) {
  try {
    const userId = req.user.id;
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        message: "Thiếu applicationId.",
      });
    }

    // 1. Lấy đơn ứng tuyển
    const { data: application, error: applicationError } = await supabaseAdmin
      .from("applications")
      .select("id, job_id, candidate_id")
      .eq("id", applicationId)
      .single();

    if (applicationError || !application) {
      return res.status(404).json({
        message: "Không tìm thấy đơn ứng tuyển.",
      });
    }

    // 2. Lấy job để biết nhà tuyển dụng
    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("id, recruiter_id")
      .eq("id", application.job_id)
      .single();

    if (jobError || !job) {
      return res.status(404).json({
        message: "Không tìm thấy tin tuyển dụng.",
      });
    }

    // 3. Kiểm tra quyền mở chat
    const isCandidate = application.candidate_id === userId;
    const isRecruiter = job.recruiter_id === userId;

    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({
        message: "Bạn không có quyền mở hội thoại này.",
      });
    }

    // 4. Nếu đã có conversation thì trả về
    const { data: existingConversation } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .eq("application_id", application.id)
      .maybeSingle();

    if (existingConversation) {
      return res.json(existingConversation);
    }

    // 5. Nếu chưa có thì tạo mới
    const { data: newConversation, error: createError } = await supabaseAdmin
      .from("conversations")
      .insert({
        application_id: application.id,
        job_id: application.job_id,
        candidate_id: application.candidate_id,
        recruiter_id: job.recruiter_id,
      })
      .select()
      .single();

    if (createError) throw createError;

    return res.status(201).json(newConversation);
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi mở hội thoại.",
      error: error.message,
    });
  }
}
```

---

### 12.3. Lấy lịch sử tin nhắn

```js
export async function getMessages(req, res) {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    // 1. Kiểm tra user có thuộc conversation không
    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (conversationError || !conversation) {
      return res.status(404).json({
        message: "Không tìm thấy hội thoại.",
      });
    }

    const isCandidate = conversation.candidate_id === userId;
    const isRecruiter = conversation.recruiter_id === userId;

    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({
        message: "Bạn không có quyền xem tin nhắn của hội thoại này.",
      });
    }

    // 2. Lấy messages
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) throw messagesError;

    return res.json(messages);
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi lấy tin nhắn.",
      error: error.message,
    });
  }
}
```

---

### 12.4. Gửi tin nhắn

```js
export async function sendMessage(req, res) {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const {
      content,
      messageType = "TEXT",
      fileUrl = null,
      fileName = null,
      fileSize = null,
    } = req.body;

    if (messageType === "TEXT" && !content?.trim()) {
      return res.status(400).json({
        message: "Nội dung tin nhắn không được rỗng.",
      });
    }

    if (messageType === "FILE" && !fileUrl) {
      return res.status(400).json({
        message: "Tin nhắn file cần có fileUrl.",
      });
    }

    // 1. Kiểm tra conversation
    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (conversationError || !conversation) {
      return res.status(404).json({
        message: "Không tìm thấy hội thoại.",
      });
    }

    const isCandidate = conversation.candidate_id === userId;
    const isRecruiter = conversation.recruiter_id === userId;

    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({
        message: "Bạn không có quyền gửi tin nhắn trong hội thoại này.",
      });
    }

    const receiverId = isCandidate
      ? conversation.recruiter_id
      : conversation.candidate_id;

    // 2. Lưu message
    const { data: message, error: messageError } = await supabaseAdmin
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: receiverId,
        message_type: messageType,
        content: messageType === "TEXT" ? content.trim() : content,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // 3. Cập nhật conversation
    const lastMessage =
      messageType === "TEXT"
        ? content.trim()
        : fileName
          ? `Đã gửi file: ${fileName}`
          : "Đã gửi file";

    await supabaseAdmin
      .from("conversations")
      .update({
        last_message: lastMessage,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    // 4. Tạo notification cho người nhận
    await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: receiverId,
        type: "NEW_MESSAGE",
        title: "Tin nhắn mới",
        content: lastMessage,
        conversation_id: conversationId,
      });

    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi gửi tin nhắn.",
      error: error.message,
    });
  }
}
```

---

### 12.5. Đánh dấu đã đọc

```js
export async function markMessagesAsRead(req, res) {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    // 1. Kiểm tra user có thuộc conversation không
    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (conversationError || !conversation) {
      return res.status(404).json({
        message: "Không tìm thấy hội thoại.",
      });
    }

    const isCandidate = conversation.candidate_id === userId;
    const isRecruiter = conversation.recruiter_id === userId;

    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({
        message: "Bạn không có quyền cập nhật hội thoại này.",
      });
    }

    // 2. Chỉ đánh dấu tin nhắn mà user hiện tại là người nhận
    const { error: updateError } = await supabaseAdmin
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("receiver_id", userId);

    if (updateError) throw updateError;

    return res.json({
      message: "Đã đánh dấu tin nhắn là đã đọc.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi đánh dấu đã đọc.",
      error: error.message,
    });
  }
}
```

---

## 13. Frontend: API gọi ExpressJS

Tạo file `src/api/chatApi.js`:

```js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export async function getConversations() {
  const res = await fetch(`${API_URL}/api/chat/conversations`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Không lấy được danh sách hội thoại.");
  }

  return res.json();
}

export async function openConversation(applicationId) {
  const res = await fetch(`${API_URL}/api/chat/conversations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ applicationId }),
  });

  if (!res.ok) {
    throw new Error("Không mở được hội thoại.");
  }

  return res.json();
}

export async function getMessages(conversationId) {
  const res = await fetch(
    `${API_URL}/api/chat/conversations/${conversationId}/messages`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Không lấy được tin nhắn.");
  }

  return res.json();
}

export async function sendTextMessage(conversationId, content) {
  const res = await fetch(
    `${API_URL}/api/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        messageType: "TEXT",
        content,
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Gửi tin nhắn thất bại.");
  }

  return res.json();
}

export async function sendFileMessage(conversationId, fileData) {
  const res = await fetch(
    `${API_URL}/api/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        messageType: "FILE",
        content: null,
        fileUrl: fileData.fileUrl,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Gửi file thất bại.");
  }

  return res.json();
}
```

---

## 14. Frontend: nghe tin nhắn realtime

Tạo hook `src/hooks/useMessagesRealtime.js`:

```js
import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useMessagesRealtime(conversationId, onNewMessage) {
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onNewMessage(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, onNewMessage]);
}
```

Ý nghĩa:

```txt
Khi bảng messages có dòng mới với conversation_id hiện tại
→ React nhận payload.new
→ thêm message mới vào màn hình chat
```

---

## 15. Frontend: nghe thông báo realtime

Tạo hook `src/hooks/useNotificationsRealtime.js`:

```js
import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useNotificationsRealtime(userId, onNewNotification) {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onNewNotification(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNewNotification]);
}
```

Dùng để hiện toast hoặc tăng số lượng thông báo ở icon chuông.

---

## 16. Frontend: upload file lên Supabase Storage

Tạo file `src/api/uploadChatFile.js`:

```js
import { supabase } from "../lib/supabase";

export async function uploadChatFile(file, conversationId) {
  const safeFileName = file.name.replace(/\s+/g, "_");
  const filePath = `${conversationId}/${Date.now()}-${safeFileName}`;

  const { data, error } = await supabase.storage
    .from("chat-files")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from("chat-files")
    .getPublicUrl(data.path);

  return {
    fileUrl: publicUrlData.publicUrl,
    fileName: file.name,
    fileSize: file.size,
  };
}
```

Luồng gửi file:

```txt
User chọn file
→ React upload file lên Supabase Storage
→ nhận fileUrl
→ React gọi API ExpressJS gửi message type FILE
→ ExpressJS lưu message vào bảng messages
→ Supabase Realtime đẩy message file cho bên nhận
```

---

## 17. Ví dụ component ChatBox

```jsx
import { useCallback, useEffect, useState } from "react";
import { getMessages, sendTextMessage } from "../api/chatApi";
import { useMessagesRealtime } from "../hooks/useMessagesRealtime";

export default function ChatBox({ conversationId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!conversationId) return;

    async function loadMessages() {
      const data = await getMessages(conversationId);
      setMessages(data);
    }

    loadMessages();
  }, [conversationId]);

  const handleNewMessage = useCallback((newMessage) => {
    setMessages((prev) => {
      const existed = prev.some((msg) => msg.id === newMessage.id);

      if (existed) {
        return prev;
      }

      return [...prev, newMessage];
    });
  }, []);

  useMessagesRealtime(conversationId, handleNewMessage);

  async function handleSend() {
    const text = content.trim();

    if (!text) return;

    await sendTextMessage(conversationId, text);

    setContent("");
  }

  return (
    <div className="chat-box">
      <div className="messages">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;

          return (
            <div
              key={msg.id}
              className={isMine ? "message mine" : "message other"}
            >
              {msg.message_type === "TEXT" ? (
                <p>{msg.content}</p>
              ) : (
                <a href={msg.file_url} target="_blank" rel="noreferrer">
                  {msg.file_name || "Tệp đính kèm"}
                </a>
              )}
            </div>
          );
        })}
      </div>

      <div className="message-input">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nhập tin nhắn..."
        />

        <button onClick={handleSend}>Gửi</button>
      </div>
    </div>
  );
}
```

---

## 18. Ví dụ gửi file trong React

```jsx
import { uploadChatFile } from "../api/uploadChatFile";
import { sendFileMessage } from "../api/chatApi";

export default function FileInput({ conversationId }) {
  async function handleFileChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    const uploadedFile = await uploadChatFile(file, conversationId);

    await sendFileMessage(conversationId, uploadedFile);
  }

  return (
    <input
      type="file"
      onChange={handleFileChange}
    />
  );
}
```

---

## 19. Luồng xử lý nghiệp vụ đầy đủ

### 19.1. Ứng viên bấm "Nhắn tin"

```txt
Ứng viên bấm "Nhắn tin" ở job đã ứng tuyển
→ React gọi POST /api/chat/conversations
→ Body gửi applicationId
→ ExpressJS kiểm tra application có tồn tại không
→ ExpressJS kiểm tra user hiện tại có phải candidate của application không
→ ExpressJS kiểm tra job thuộc recruiter nào
→ Nếu hợp lệ: tạo hoặc trả về conversation
→ React chuyển sang trang Chat
```

---

### 19.2. Nhà tuyển dụng bấm "Nhắn tin"

```txt
Nhà tuyển dụng vào danh sách ứng viên đã ứng tuyển
→ Bấm "Nhắn tin"
→ React gọi POST /api/chat/conversations
→ Body gửi applicationId
→ ExpressJS kiểm tra application có tồn tại không
→ ExpressJS kiểm tra job của application có thuộc nhà tuyển dụng này không
→ Nếu hợp lệ: tạo hoặc trả về conversation
→ React chuyển sang trang Chat
```

---

### 19.3. Gửi tin nhắn text

```txt
User nhập nội dung
→ React gọi POST /api/chat/conversations/:id/messages
→ ExpressJS kiểm tra user có thuộc conversation không
→ ExpressJS lưu message
→ ExpressJS cập nhật last_message
→ ExpressJS tạo notification
→ Supabase Realtime đẩy message cho bên nhận
```

---

### 19.4. Gửi file

```txt
User chọn file
→ React upload file lên Supabase Storage
→ React nhận fileUrl
→ React gọi API gửi message FILE
→ ExpressJS lưu message FILE
→ Realtime cập nhật giao diện
```

---

## 20. Có nên dùng Socket.IO không?

Với stack hiện tại, chưa cần dùng Socket.IO.

Nên dùng Supabase Realtime vì:

- Bạn đã có Supabase.
- Tin nhắn lưu trực tiếp trong PostgreSQL.
- Không cần dựng thêm WebSocket server.
- Dễ demo.
- Dễ giải thích trong báo cáo.

Chỉ nên dùng Socket.IO nếu sau này cần:

- Typing indicator phức tạp.
- Online/offline realtime nâng cao.
- Chat group lớn.
- Kiểm soát socket room chi tiết.
- Không muốn phụ thuộc Supabase Realtime.

---

## 21. Có nên dùng Firebase không?

Không nên dùng Firebase trong dự án này.

Lý do:

```txt
Dự án đã dùng Supabase/PostgreSQL.
Nếu thêm Firebase thì dữ liệu bị tách làm 2 nơi:
- User, job, application nằm ở PostgreSQL.
- Chat nằm ở Firebase.

Điều này làm hệ thống khó quản lý, khó kiểm tra quyền và khó bảo vệ đồ án.
```

---

## 22. Checklist triển khai

### Database

- [ ] Tạo bảng `conversations`
- [ ] Tạo bảng `messages`
- [ ] Tạo bảng `notifications`
- [ ] Tạo index cho các bảng
- [ ] Bật realtime cho `messages`
- [ ] Bật realtime cho `notifications`

### Supabase Storage

- [ ] Tạo bucket `chat-files`
- [ ] Kiểm tra upload file thành công
- [ ] Lưu `file_url` vào bảng `messages`

### Backend ExpressJS

- [ ] Tạo Supabase admin client
- [ ] Viết API lấy danh sách hội thoại
- [ ] Viết API mở/tạo hội thoại
- [ ] Viết API lấy lịch sử tin nhắn
- [ ] Viết API gửi tin nhắn
- [ ] Viết API đánh dấu đã đọc
- [ ] Kiểm tra user có thuộc hội thoại không
- [ ] Kiểm tra ứng viên đã ứng tuyển chưa
- [ ] Tạo notification khi gửi tin nhắn

### Frontend React

- [ ] Tạo Supabase frontend client
- [ ] Tạo trang Chat
- [ ] Tạo danh sách hội thoại
- [ ] Tạo ChatBox
- [ ] Tạo MessageInput
- [ ] Subscribe realtime bảng `messages`
- [ ] Subscribe realtime bảng `notifications`
- [ ] Upload file lên Supabase Storage
- [ ] Gửi message dạng `TEXT`
- [ ] Gửi message dạng `FILE`

### Test

- [ ] Ứng viên đã ứng tuyển có thể mở chat
- [ ] Ứng viên chưa ứng tuyển không thể mở chat
- [ ] Nhà tuyển dụng chỉ chat được với ứng viên đã ứng tuyển job của mình
- [ ] Người ngoài conversation không xem được tin nhắn
- [ ] Gửi text thành công
- [ ] Gửi file thành công
- [ ] Tin nhắn hiện realtime ở bên nhận
- [ ] Notification hiện khi có tin nhắn mới
- [ ] Đánh dấu đã đọc hoạt động đúng

---

## 23. Cách giải thích trong báo cáo

Có thể viết như sau:

```txt
Chức năng chat với nhà tuyển dụng được triển khai bằng PostgreSQL kết hợp Supabase Realtime. ExpressJS chịu trách nhiệm xử lý nghiệp vụ và kiểm tra quyền chat, đảm bảo chỉ ứng viên đã ứng tuyển vào tin tuyển dụng mới có thể mở hội thoại với nhà tuyển dụng. Tin nhắn được lưu trong bảng messages, hội thoại được lưu trong bảng conversations. Khi có tin nhắn mới, Supabase Realtime lắng nghe sự kiện INSERT trên bảng messages và cập nhật giao diện React theo thời gian thực. File đính kèm được lưu trên Supabase Storage, hệ thống chỉ lưu đường dẫn file trong database.
```

---

## 24. Tài liệu Supabase nên tham khảo

- Supabase Realtime Postgres Changes: https://supabase.com/docs/guides/realtime/postgres-changes
- Supabase Realtime Overview: https://supabase.com/docs/guides/realtime
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase JavaScript Storage Upload: https://supabase.com/docs/reference/javascript/storage-from-upload
- Supabase API Keys: https://supabase.com/docs/guides/getting-started/api-keys
