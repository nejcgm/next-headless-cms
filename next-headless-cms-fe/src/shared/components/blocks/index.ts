import { registerSharedBlocks } from "@core/blocks/registry";

import { CtaBanner } from "./cta-banner";
import { SectionHeader } from "./section-header";
import { StatsBar } from "./stats-bar";
import { ImageText } from "./image-text";
import { RichText } from "./rich-text";
import { ImageGallery } from "./image-gallery";

registerSharedBlocks({
  "cta-banner": { component: CtaBanner },
  "section-header": { component: SectionHeader },
  "stats-bar": { component: StatsBar },
  "image-text": { component: ImageText },
  "rich-text": { component: RichText },
  "image-gallery": { component: ImageGallery },
});
