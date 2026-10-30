import "./App.css";
import DeveloperCard from "./components/DeveloperCard";

const developer = {
    name: "Pham Minh Quan",
    role: "Frontend Developer",
    location: "Ho Chi Minh City, Vietnam",
    bio: "Passionate about web development and modern technologies.",
    avatar: "/images/avatar.jpg",   
    skills: [
        { id: "react", name: "React", level: "Advanced" },
        { id: "javascript", name: "JavaScript", level: "Advanced" },
        { id: "html", name: "HTML", level: "Intermediate" },
        { id: "css", name: "CSS", level: "Intermediate" }
    ]
};

export default function App() {
    return (
        <main>
            <h1 style={{ textAlign: "center" }}>
                Developer Profile
            </h1>

            <DeveloperCard {...developer} />
        </main>
    );
}