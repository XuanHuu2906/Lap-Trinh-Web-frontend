const darkBadgeTones = [
  {
    token: "emerald",
    className:
      "dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300",
  },
  {
    token: "amber",
    className: "dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300",
  },
  {
    token: "rose",
    className: "dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300",
  },
  {
    token: "red",
    className: "dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300",
  },
  {
    token: "blue",
    className: "dark:bg-blue-950/40 dark:border-blue-900/60 dark:text-blue-300",
  },
  {
    token: "indigo",
    className:
      "dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-300",
  },
  {
    token: "slate",
    className: "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300",
  },
];

export const getAdminBadgeClass = (badgeColor: string) => {
  const darkTone = darkBadgeTones.find(({ token }) =>
    badgeColor.includes(token),
  );

  return `${badgeColor} ${
    darkTone?.className ||
    "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
  }`;
};
