// Page temporal para verificar el funcionamiento del Navbar
import Hero from "./Hero";
import LoginBanner from "./LoginBanner";
import MissionVision from "./MissionVision";
import TeamGrid from "./TeamGrid";
export default function AboutPage() {
	return (
		<>
			<Hero />
			<MissionVision />
			<TeamGrid />
			<LoginBanner />
		</>
	);
}
