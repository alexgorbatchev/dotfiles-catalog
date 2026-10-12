import { defineTool, Platform } from "@alexgorbatchev/dotfiles";

/**
 * Poppler - PDF rendering library based on the xpdf-3.0 code base.
 * Provides `pdftoppm`, which is used by yazi for PDF previews.
 *
 * https://poppler.freedesktop.org
 */
export default defineTool((install) =>
  install()
    .bin("pdftoppm")
    .platform(Platform.MacOS, (install) =>
      install("brew", {
        formula: "poppler",
      }),
    )
    .platform(Platform.Linux, (install) =>
      install("apt", {
        package: "poppler-utils",
      }).sudo(),
    ),
);
