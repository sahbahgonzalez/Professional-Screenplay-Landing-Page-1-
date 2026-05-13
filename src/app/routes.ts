import { createBrowserRouter } from "react-router";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Logline } from "./pages/Logline";
import { Synopsis } from "./pages/Synopsis";
import { PitchDeck } from "./pages/PitchDeck";
import { Snippets } from "./pages/Snippets";
import { Author } from "./pages/Author";
import { RequestScript } from "./pages/RequestScript";
import { Copyright } from "./pages/Copyright";
import { Settings } from "./pages/Settings";
import { ReaderReviews } from "./pages/ReaderReviews";
import { ProfessionalEvaluations } from "./pages/ProfessionalEvaluations";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "logline", Component: Logline },
      { path: "synopsis", Component: Synopsis },
      { path: "pitch-deck", Component: PitchDeck },
      { path: "snippets", Component: Snippets },
      { path: "author", Component: Author },
      { path: "reader-reviews", Component: ReaderReviews },
      { path: "professional-evaluations", Component: ProfessionalEvaluations },
      { path: "request-script", Component: RequestScript },
      { path: "copyright", Component: Copyright },
      { path: "settings", Component: Settings },
    ],
  },
]);