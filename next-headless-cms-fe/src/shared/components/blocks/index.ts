import { registerSharedBlocks } from "@core/blocks/registry";

import { CtaBanner } from "./cta-banner";
import { ctaBannerSchema } from "./cta-banner.schema";
import { SectionHeader } from "./section-header";
import { sectionHeaderSchema } from "./section-header.schema";
import { StatsBar } from "./stats-bar";
import { statsBarSchema } from "./stats-bar.schema";
import { ImageText } from "./image-text";
import { imageTextSchema } from "./image-text.schema";
import { RichText } from "./rich-text";
import { richTextSchema } from "./rich-text.schema";
import { ImageGallery } from "./image-gallery";
import { imageGallerySchema } from "./image-gallery.schema";

registerSharedBlocks({
  "cta-banner": { component: CtaBanner, schema: ctaBannerSchema },
  "section-header": { component: SectionHeader, schema: sectionHeaderSchema },
  "stats-bar": { component: StatsBar, schema: statsBarSchema },
  "image-text": { component: ImageText, schema: imageTextSchema },
  "rich-text": { component: RichText, schema: richTextSchema },
  "image-gallery": { component: ImageGallery, schema: imageGallerySchema },
});
