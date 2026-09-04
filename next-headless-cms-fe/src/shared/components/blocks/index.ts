import { registerSharedBlocks } from "@core/blocks/registry";

import { Section } from "./section/section";
import { sectionPolicy, sectionSchema } from "./section/schema";
import { Stack } from "./stack/stack";
import { stackPolicy, stackSchema } from "./stack/schema";
import { Flex } from "./flex/flex";
import { flexPolicy, flexSchema } from "./flex/schema";
import { Grid } from "./grid/grid";
import { gridPolicy, gridSchema } from "./grid/schema";
import { Text } from "./text/text";
import { textPolicy, textSchema } from "./text/schema";
import { ImageBlock } from "./image/image";
import { imagePolicy, imageSchema } from "./image/schema";
import { ButtonBlock } from "./button/button";
import { buttonPolicy, buttonSchema } from "./button/schema";
import { Heading } from "./heading/heading";
import { headingPolicy, headingSchema } from "./heading/schema";

registerSharedBlocks({
  section: { component: Section, schema: sectionSchema, policy: sectionPolicy },
  stack: { component: Stack, schema: stackSchema, policy: stackPolicy },
  flex: { component: Flex, schema: flexSchema, policy: flexPolicy },
  grid: { component: Grid, schema: gridSchema, policy: gridPolicy },
  heading: { component: Heading, schema: headingSchema, policy: headingPolicy },
  text: { component: Text, schema: textSchema, policy: textPolicy },
  image: { component: ImageBlock, schema: imageSchema, policy: imagePolicy },
  button: { component: ButtonBlock, schema: buttonSchema, policy: buttonPolicy },
});
