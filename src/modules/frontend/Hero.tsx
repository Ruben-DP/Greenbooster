import { LogIn } from "lucide-react";

interface HeroProps {
  title: string;
  imageUrl: string;
}

export default function Hero({ title, imageUrl }: HeroProps) {
  return (
    <section className="hero">
      <img className="hero__image" src={imageUrl} alt="Hero Background" />
      <h1 className="hero__title">{title}</h1>
      <a href="/admin/maatregelen" className="hero__button">
        <LogIn size={20} />
        Admin login
      </a>
    </section>
  );
}
