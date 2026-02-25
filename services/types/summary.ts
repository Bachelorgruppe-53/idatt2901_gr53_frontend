export type UserIdHeader = {
  "X-User-ID": string;
};

export const GET_SUMMARY_PATH = "/user/summary";

export type UserSummary = {
  nickname: string;
  points: number;
  className: string;
  schoolName: string;
  classCode: string;
};

export type SummaryUnauthorizedError = {
  status: 401;
  message: "User not found";
};

export type SummaryNoClassError = {
  message: "This user is not related to a class";
};

export type GetSummaryResponse = UserSummary;

export type GetSummaryError = SummaryUnauthorizedError | SummaryNoClassError;
