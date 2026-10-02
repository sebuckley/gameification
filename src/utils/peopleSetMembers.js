const PRESENTER_TYPES = new Set(["presenter", "keynote-speaker"]);

export const getPersonForPeopleSet = (person, peopleSetId) => {
  if (!person || !peopleSetId) return person;

  const { engagementNotes, ...membershipSettings } = person.peopleSetDetails?.[peopleSetId] || {};
  const personType = membershipSettings.personType ?? person.personType ?? (person.isPresenter ? "presenter" : "participant");

  return {
    ...person,
    ...membershipSettings,
    personType,
    isPresenter: PRESENTER_TYPES.has(personType),
    inSpinner: membershipSettings.inSpinner ?? person.inSpinner,
    inGroups: membershipSettings.inGroups ?? person.inGroups,
  };
};

export const getPeopleSetRoster = (people, peopleSet) => {
  if (!peopleSet) return people;

  const memberIds = new Set(peopleSet.personIds || []);
  return people
    .filter((person) => memberIds.has(person.id))
    .map((person) => getPersonForPeopleSet(person, peopleSet.id));
};