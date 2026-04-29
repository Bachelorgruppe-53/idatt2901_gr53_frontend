export type UserIdHeader = {
  "X-User-ID": string;
};

export type GetClassRequest = {
  code: string;
};

export type StudentSummary = {
  nickname: string;
  points: number;
};

export type PagedSchoolClassesResponse = {
  content: StudentSummary[];
  pageable?: unknown;
  last?: boolean;
  totalPages?: number;
  totalElements?: number;
  size?: number;
  number?: number;
  sort?: unknown;
  first?: boolean;
  numberOfElements?: number;
  empty?: boolean;
};

export type GetClassResponse = {
  name: string;
  list: PagedSchoolClassesResponse;
};

export type GetClassInfoResponse = {
  className: string;
  schoolName: string;
  points: number;
};

export const GET_CLASS_PATH = "/class/class";
export const GET_CLASS_INFO_PATH = "/class/info";
