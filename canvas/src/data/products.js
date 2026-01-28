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
    previewMockups: {
      front: "/previews/hoodie/Front.png",
      back: "/previews/hoodie/Back.png",
      folded: "/previews/hoodie/Folded.png",
      person1: "/previews/hoodie/Person1.png",
      person2: "/previews/hoodie/Person2.png",
      person3: "/previews/hoodie/Person3.png",
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
    previewMockups: {
      front: "/previews/crewneck/Front.png",
      back: "/previews/crewneck/Back.png",
      folded: "/previews/crewneck/Folded.png",
      person1: "/previews/crewneck/Person1.png",
      person2: "/previews/crewneck/Person2.png",
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
    previewMockups: {
      front: "/previews/t-shirt/Front.png",
      back: "/previews/t-shirt/Back.png",
      folded: "/previews/t-shirt/Folded.png",
      person1Front: "/previews/t-shirt/Person1Front.png",
      person1Back: "/previews/t-shirt/Person1Back.png",
      person2: "/previews/t-shirt/Person2.png",
      person3Front: "/previews/t-shirt/Person3Front.png",
      person3Back: "/previews/t-shirt/Person3Back.png",
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
    previewMockups: {
      mug: "/mockups/mug/mug.png",
    },
  },
];
