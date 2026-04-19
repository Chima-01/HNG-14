 type CountryInput = { 
  country_id: string;
  probability: number;
 }
 
 export const checkData = (gender: string | null, count: number, age: number | null, countries: CountryInput[] | undefined) => {
    if (!gender || count <= 0) {
      return { status: false, message: "Genderize" };
    }
  
    if (age === null || age === undefined || age < 0) {
      return { status: false, message: "Agify" };
    }

   if (!countries || countries.length <= 0) {
      return { status: false, message: "Nationalize" }
   }

   return { status: true, message: "Data is valid" }
}


export const parseNumber = (value: any): number => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export const findHighestCountryProbability = (countries: CountryInput[]): CountryInput => {
  if (!countries || countries.length <= 0) return { country_id: "", probability: 0 };
  return countries.reduce((max, country) => country.probability > max.probability ? country : max);
}

export const classifyAge = (age: number) => {
  switch (true) {
    case (age < 0): return "Invalid age";
    case (age <= 12): return "Child";
    case (age <= 19): return "Teenager";
    case (age < 60): return "Adult";
    default: return "Senior";
  }
};