export const products = [
  {
    id: "hoodie-heavy-blend",
    name: "Unisex Heavy Blend™ Hooded Sweatshirt",
    priceFrom: 21.58,
    thumbnail: "/hoodie.png",
    hoverImage: "/printed-hoodie.png",
    type: "hoodie",

    sides: [
      { key: "front", label: "Front side" },
      { key: "back", label: "Back side" },
      { key: "sleeveLeft", label: "Sleeve left" },
      { key: "sleeveRight", label: "Sleeve right" },
      { key: "neck", label: "Neck label inner" },
    ],

    mockups: {
      front: "/mockups/hoodie/front.png",
      back: "/mockups/hoodie/back.png",
      sleeveLeft: "/mockups/hoodie/sleeve-left.png",
      sleeveRight: "/mockups/hoodie/sleeve-right.png",
      neck: "/mockups/hoodie/neck.png",
    },
  },

  {
    id: "crewneck-heavy-blend",
    name: "Unisex Heavy Blend™ Crewneck Sweatshirt",
    priceFrom: 15.24,
    thumbnail: "/crewneck.png",
    hoverImage: "/printed-crewneck.png",
    type: "crewneck",

    sides: [
      { key: "front", label: "Front side" },
      { key: "back", label: "Back side" },
      { key: "sleeveLeft", label: "Sleeve left" },
      { key: "sleeveRight", label: "Sleeve right" },
      { key: "neck", label: "Neck label inner" },
    ],

    mockups: {
      front: "/mockups/crewneck/front.png",
      back: "/mockups/crewneck/back.png",
      sleeveLeft: "/mockups/crewneck/sleeve-left.png",
      sleeveRight: "/mockups/crewneck/sleeve-right.png",
      neck: "/mockups/crewneck/neck.png",
    },
  },

  {
    id: "garment-dyed-tshirt",
    name: "Unisex Garment-Dyed T-shirt",
    priceFrom: 12.41,
    thumbnail: "/tshirt.png",
    hoverImage: "/printed-tshirt.png",
    type: "tshirt",

    sides: [
      { key: "front", label: "Front side" },
      { key: "back", label: "Back side" },
    ],

    mockups: {
      front: "/tshirt.png",
      back: "/tshirt.png",
    },
  },

  {
    id: "ceramic-mug",
    name: "Ceramic Mug (11oz, 15oz)",
    priceFrom: 4.93,
    thumbnail: "/mug.png",
    hoverImage: "/printed-mug.png",
    type: "mug",

    sides: [
      { key: "front", label: "Front side" },
      { key: "back", label: "Back side" },
    ],

    mockups: {
      front: "/mockups/mug/front.png",
      back: "/mockups/mug/back.png",
    },
  },
];
