export const jobTypeLabels: Record<string, string> = {
  "full-time": "Full Time",
  full_time: "Full Time",
  "part-time": "Part Time",
  part_time: "Part Time",
  remote: "Remote",
  hybrid: "Hybrid",
  freelance: "Freelance",
  internship: "Internship",
  contract: "Contract",
};

export const formatJobTypeLabel = (value?: string | null) => {
  if (!value) return "Chưa cập nhật";
  return jobTypeLabels[value] || value;
};
