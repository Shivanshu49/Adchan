import failures from "@/types/failures";
import personas from "@/types/personas";


export function getPersonaAndFailure(regNo: string) {
  const persona = personas.find((item) => item.regNo === regNo);
  if (!persona) return null;
  const failure = failures.find((item) => item.code === persona.failureCode);
  return failure ? { persona, failure } : null;
}
