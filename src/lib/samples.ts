import { SampleScenario } from "@/types/xray";

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: "streamvault-checkout",
    title: "StreamVault Ultra Checkout",
    subtitle: "400% hidden drip fees, pre-checked add-ons & confirmshaming",
    industry: "Streaming / SaaS",
    imagePath: "/samples/streamvault-checkout.svg",
    difficultyBadge: "Predatory Checkout",
    expectedTrapsCount: 5,
  },
  {
    id: "cloudnest-cancel",
    title: "CloudNest Cancellation Maze",
    subtitle: "Roach motel phone loop, trick double-negatives & visual misdirection",
    industry: "Cloud Storage",
    imagePath: "/samples/cloudnest-cancel.svg",
    difficultyBadge: "Roach Motel",
    expectedTrapsCount: 4,
  },
  {
    id: "skyfare-booking",
    title: "SkyFare Express Ticket Trap",
    subtitle: "Fake 1-seat urgency, forced quarterly club & junk carrier fees",
    industry: "Travel / Airlines",
    imagePath: "/samples/skyfare-booking.svg",
    difficultyBadge: "Drip Pricing",
    expectedTrapsCount: 5,
  },
];