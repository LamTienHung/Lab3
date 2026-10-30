export default function SkillBadge({ name, level = "Intermediate" }) {
    return (
        <li>
            <span>{name}</span>
            <small> — {level}</small>
        </li>
    );
}