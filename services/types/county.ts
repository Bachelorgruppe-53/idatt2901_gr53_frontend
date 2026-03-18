export type UserIdHeader = {
  "X-User-ID": string;
};

export type GetCountyRequest = {
  name: string;
};

export type CountySchoolSummary = {
  className: string;
  points: number;
};

export type CountyPage = {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
};

export type GetCountyResponse = {
  content: CountySchoolSummary[];
  page: CountyPage;
};

export const GET_COUNTY_PATH = "/class/county";

export type CountyClassSummary = {
  className: string;
  schoolName: string;
  points: number;
};

export type GetCountyClassesResponse = {
  content: CountyClassSummary[];
  page: CountyPage;
};

export const GET_COUNTY_CLASSES_PATH = "/class/all";
