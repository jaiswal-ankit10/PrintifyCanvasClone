export const products = [
  {
    id: "hoodie-heavy-blend",
    name: "Unisex Heavy Blend™ Hooded Sweatshirt",
    priceFrom: 21.58,
    thumbnail: "/hoodie.png",
    hoverImage: "/printed-hoodie.png",
    type: "hoodie",

    sides: [
      {
        key: "front",
        label: "Front side",
        printDimensions: {
          width: 150,
          height: 120,
          topOffset: -40,
          leftOffset: 0,
        },
      },
      {
        key: "back",
        label: "Back side",
        printDimensions: {
          width: 160,
          height: 180,
          topOffset: 0,
          leftOffset: 0,
        },
      },
      {
        key: "sleeveLeft",
        label: "Sleeve left",
        printDimensions: {
          width: 80,
          height: 350,
          topOffset: 0,
          leftOffset: 0,
        },
      },
      {
        key: "sleeveRight",
        label: "Sleeve right",
        printDimensions: {
          width: 80,
          height: 350,
          topOffset: 0,
          leftOffset: 0,
        },
      },
      {
        key: "neck",
        label: "Neck label inner",
        printDimensions: {
          width: 100,
          height: 90,
          topOffset: -20,
          leftOffset: 0,
        },
      },
    ],

    mockups: {
      front: "/mockups/hoodies/front.png",
      back: "/mockups/hoodies/back.png",
      sleeveLeft: "/mockups/hoodies/sleeveLeft.png",
      sleeveRight: "/mockups/hoodies/sleeveRight.png",
      neck: "/mockups/hoodies/neck.png",
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
      {
        key: "front",
        label: "Front side",
        printDimensions: {
          width: 200,
          height: 260,
          topOffset: 15,
          leftOffset: 0,
        },
      },
      {
        key: "back",
        label: "Back side",
        printDimensions: {
          width: 200,
          height: 260,
          topOffset: 10,
          leftOffset: 0,
        },
      },
      {
        key: "sleeveLeft",
        label: "Sleeve left",
        printDimensions: {
          width: 80,
          height: 350,
          topOffset: 0,
          leftOffset: 0,
        },
      },
      {
        key: "sleeveRight",
        label: "Sleeve right",
        printDimensions: {
          width: 80,
          height: 350,
          topOffset: 0,
          leftOffset: 0,
        },
      },
      {
        key: "neck",
        label: "Neck label inner",
        printDimensions: {
          width: 100,
          height: 90,
          topOffset: -170,
          leftOffset: 0,
        },
      },
    ],

    mockups: {
      front: "/mockups/crewneck/front.png",
      back: "/mockups/crewneck/back.png",
      sleeveLeft: "/mockups/crewneck/sleeveLeft.png",
      sleeveRight: "/mockups/crewneck/sleeveRight.png",
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
      {
        key: "front",
        label: "Front side",
        printDimensions: {
          width: 200,
          height: 250,
          topOffset: 0,
          leftOffset: 0,
        },
      },
      {
        key: "back",
        label: "Back side",
        printDimensions: {
          width: 200,
          height: 250,
          topOffset: -10,
          leftOffset: 0,
        },
      },
    ],

    mockups: {
      front: "/mockups/t-shirt/front.png",
      back: "/mockups/t-shirt/back.png",
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
      {
        key: "mug",
        label: "",
        printDimensions: {
          width: 1160,
          height: 480,
          topOffset: 0,
          leftOffset: 0,
        },
      },
    ],

    mockups: {
      mug: "/mockups/mug/mug.png",
    },
  },
];
