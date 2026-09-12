// backend/utils/htmlSanitizer.js
const sanitizeHtml = require("sanitize-html");

/**
 * Sanitizes rich HTML input for School Description.
 * Whitelists legitimate educational text formatting, headings, lists, and links.
 * Strips executable scripts, dangerous event handlers (onerror, onclick),
 * unsafe protocols (javascript:, vbscript:), iframes, objects, and SVGs.
 */
const sanitizeSchoolDescription = (dirtyHtml) => {
  if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

  return sanitizeHtml(dirtyHtml, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr", "blockquote", "pre", "code",
      "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup",
      "span", "div", "ul", "ol", "li",
      "a", "img"
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height"],
      span: ["class"],
      div: ["class"],
      p: ["class"],
      h1: ["class"], h2: ["class"], h3: ["class"], h4: ["class"], h5: ["class"], h6: ["class"]
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto", "tel"],
      img: ["http", "https"]
    },
    transformTags: {
      a: (tagName, attribs) => {
        if (attribs.target === "_blank") {
          return {
            tagName: "a",
            attribs: {
              ...attribs,
              rel: "noopener noreferrer"
            }
          };
        }
        return { tagName: "a", attribs };
      }
    }
  });
};

module.exports = {
  sanitizeSchoolDescription
};
