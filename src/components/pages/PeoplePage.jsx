import PeopleManager from "../people/PeopleManager";

export default function PeoplePage() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">People Manager</h1>
      <PeopleManager />
    </div>
  );
}
