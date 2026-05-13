export interface Snippet {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  image?: string;
}

// Note: "Snippet" is the internal data structure name, but displayed as "Sneak Peeks" to users
export const snippets: Snippet[] = [
  {
    id: 1,
    title: "Opening Scene: The Discovery",
    date: "2026-03-08",
    excerpt: `The camera pans across a desolate warehouse district at dusk. Sarah's footsteps echo against wet concrete as she approaches the abandoned building. Her breath forms small clouds in the cold air. Inside, she finds what she's been searching for—but it's not what she expected. The truth is far more dangerous than she could have imagined.`,
    image: "https://images.unsplash.com/photo-1764581659081-af662e1db71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWxtJTIwcHJvZHVjdGlvbiUyMGNhbWVyYSUyMHNjZW5lfGVufDF8fHx8MTc3MzE2MzUzNHww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 2,
    title: "Character Study: Marcus",
    date: "2026-03-01",
    excerpt: `Marcus sits alone in the dimly lit diner, methodically stirring his coffee. He's been running for three years, always one step ahead. But tonight feels different. The waitress refills his cup without asking—she knows his routine. He doesn't know she's been watching him, waiting for the right moment. In the reflection of the window, he sees her hand move toward her pocket.`,
    image: "https://images.unsplash.com/photo-1705822898715-369170f541cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHRoZWF0ZXIlMjBjaW5lbWElMjBzZWF0c3xlbnwxfHx8fDE3NzMwNzQ3OTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 3,
    title: "The Turning Point",
    date: "2026-02-23",
    excerpt: `Rain hammers against the rooftop as Sarah and Marcus face each other for the first time. Years of secrets hang between them like a curtain. "You knew," she says, her voice barely audible over the storm. "I knew," he admits. What happens next will change everything—not just for them, but for everyone they're trying to protect.`,
    image: "https://images.unsplash.com/photo-1689163455695-9270912cdda2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBzdW5zZXQlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzczMTYzNTMzfDA&ixlib=rb-4.1.0&q=80&w=1080"
  }
];
