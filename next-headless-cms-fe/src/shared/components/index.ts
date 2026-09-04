import { registerSharedBlocks } from "@core/blocks/registry";

import { Section } from "./primitives/layout/section/section";
import { sectionPolicy, sectionSchema } from "./primitives/layout/section/schema";
import { Stack } from "./primitives/layout/stack/stack";
import { stackPolicy, stackSchema } from "./primitives/layout/stack/schema";
import { Flex } from "./primitives/layout/flex/flex";
import { flexPolicy, flexSchema } from "./primitives/layout/flex/schema";
import { Grid } from "./primitives/layout/grid/grid";
import { gridPolicy, gridSchema } from "./primitives/layout/grid/schema";
import { Text } from "./primitives/content/text/text";
import { textPolicy, textSchema } from "./primitives/content/text/schema";
import { ImageBlock } from "./primitives/content/image/image";
import { imagePolicy, imageSchema } from "./primitives/content/image/schema";
import { IframeBlock } from "./primitives/content/iframe/iframe";
import { iframePolicy, iframeSchema } from "./primitives/content/iframe/schema";
import { IconBlock } from "./primitives/content/icon/icon";
import { iconPolicy, iconSchema } from "./primitives/content/icon/schema";
import { ButtonBlock } from "./primitives/actions/button/button";
import { buttonPolicy, buttonSchema } from "./primitives/actions/button/schema";
import { LinkBlock } from "./primitives/actions/link/link";
import { linkPolicy, linkSchema } from "./primitives/actions/link/schema";

registerSharedBlocks({
  section: { component: Section, schema: sectionSchema, policy: sectionPolicy },
  stack: { component: Stack, schema: stackSchema, policy: stackPolicy },
  flex: { component: Flex, schema: flexSchema, policy: flexPolicy },
  grid: { component: Grid, schema: gridSchema, policy: gridPolicy },
  text: { component: Text, schema: textSchema, policy: textPolicy },
  image: { component: ImageBlock, schema: imageSchema, policy: imagePolicy },
  iframe: { component: IframeBlock, schema: iframeSchema, policy: iframePolicy },
  icon: { component: IconBlock, schema: iconSchema, policy: iconPolicy },
  button: { component: ButtonBlock, schema: buttonSchema, policy: buttonPolicy },
  link: { component: LinkBlock, schema: linkSchema, policy: linkPolicy },
});
