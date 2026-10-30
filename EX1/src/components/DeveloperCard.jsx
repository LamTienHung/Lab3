import { useState } from "react";
import SkillBadge from "./SkillBadge";
import styles from "./DeveloperCard.module.css";

export default function DeveloperCard({
    name,
    role,
    location,
    bio,
    avatar,
    skills = []
}) {
    const [imageError, setImageError] = useState(false);

    const initials = name
        .trim()
        .split(/\s+/)
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const validAvatar =
    typeof avatar === "string" &&
    (
        avatar.startsWith("https://") ||
        avatar.startsWith("/images/")
    ) &&
    !imageError;

    return (
        <article className={styles.card} aria-labelledby="developer-name">
            <header className={styles.header}>
                {validAvatar ? (
                    <img
                        src={avatar}
                        alt={`${name}'s avatar`}
                        width="120"
                        height="120"
                        className={styles.avatar}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <span
                        className={styles.fallback}
                        aria-label={`${name}'s initials`}
                    >
                        {initials}
                    </span>
                )}

                <h2 id="developer-name">{name}</h2>
                <p className={styles.role}>{role}</p>
            </header>

            <section className={styles.details}>
                <h3>Profile Information</h3>

                <dl>
                    <dt>Location</dt>
                    <dd>{location}</dd>

                    <dt>Biography</dt>
                    <dd>{bio}</dd>
                </dl>
            </section>

            <section className={styles.skills}>
                <h3>Skills</h3>

                <ul>
                    {skills.map((skill) => (
                        <SkillBadge
                            key={skill.id}
                            name={skill.name}
                            level={skill.level}
                        />
                    ))}
                </ul>
            </section>
        </article>
    );
}