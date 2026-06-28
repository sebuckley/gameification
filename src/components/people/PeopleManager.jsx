import usePeople from "../store/usePeopleStore";
import AddPersonForm from "./AddPersonForm";
import PersonCard from "./PersonCard";

export default function PeopleManager() {
  const { people } = usePeople();

  

  return (
    <div className="space-y-6">
      <AddPersonForm />
      <div className="grid gap-4 md:grid-cols-2">
        {people.map((p) => (
          <PersonCard key={p.id} person={p} />
        ))}
      </div>
    </div>
  );
}
