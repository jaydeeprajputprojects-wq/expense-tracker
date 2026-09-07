/**

* Common frontend validation functions.
*
* Detailed business validation will be implemented
* in the relevant User Stories.
  */

export function isRequired(value) {
return value !== null &&
value !== undefined &&
String(value).trim() !== "";
}
