import { z } from 'zod';
import { getCountryCode } from 'countries-list';
import type { TCountryCode } from 'countries-list';

export const FilterOptionsSchema = z.object({ 
  gender: z.enum(["male", "female"]).optional(),
  age_group: z.enum(["child", "teenager", "adult", "senior"]).optional(),
  country_id: z.string().length(2).optional(),
  min_age: z.coerce.number().int().min(1).optional(),
  max_age: z.coerce.number().int().min(1).optional(),
  min_gender_probability: z.coerce.number().min(0).max(1).optional(),
  min_country_probability: z.coerce.number().min(0).max(1).optional(),
  sort_by: z.enum(["age", "created_at", "gender_probability"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(10)
 });

 export type FilterOptions = z.infer<typeof FilterOptionsSchema>;

 export const parseNaturalLanguage = (query: string): Partial<FilterOptions> | null => {
  const options: Partial<FilterOptions> = {};
  const lowerQuery = query?.toLowerCase() || '';
  const genderRegex = /\b(male|female)s?\b/;
  const hasMale = /\bmales?\b/.test(lowerQuery);
  const hasFemale = /\bfemales?\b/.test(lowerQuery);
  const ageGroupRegex = /\b(child|teenager|adult|senior)s?\b/;
  const countryRegex = /\bfrom\s+([a-zA-Z\s]+)\b/;
  const minAgeRegex = /\b(?:above|minimum|at least)\s+(\d{1,3})?\b/;
  const maxAgeRegex = /\b(?:below|maximum|at most)\s+(\d{1,3})?\b/;
  const youngAgeRegex = /\byoung\b/;
  let maxAge: number | null = null;
  let minAge: number | null = null;
  let countryId: TCountryCode | boolean = false;

  if (genderRegex.test(lowerQuery) && !(hasMale && hasFemale)) {
    const match = lowerQuery.match(genderRegex);
    if (match) {
      options.gender = match[1] as "male" | "female";
    }
  }

  if (ageGroupRegex.test(lowerQuery)) {
    const match = lowerQuery.match(ageGroupRegex);
    if (match) {
      options.age_group = match[1] as "child" | "teenager" | "adult" | "senior";
    }
  }

  if (countryRegex.test(lowerQuery)) {
    const match = lowerQuery.match(countryRegex);

    if (match) {
      const extractedCountry = match[1].trim();
      countryId = getCountryCode(extractedCountry);

      if (countryId) { 
        options.country_id = countryId as TCountryCode;
      }
    }
  }

  if (youngAgeRegex.test(lowerQuery)) {
      options.min_age = 16;
      options.max_age = 24;
    }

  if (minAgeRegex.test(lowerQuery)) {
    const match = lowerQuery.match(minAgeRegex);
     if (match) {
      minAge = parseInt(match[1], 10);
      options.min_age = minAge;
    }
  }

  if (maxAgeRegex.test(lowerQuery)) { 
    const match = lowerQuery.match(maxAgeRegex);
    if (match) {
      maxAge = parseInt(match[1], 10);
      options.max_age = maxAge;
    }
  }

  return options;
 } 