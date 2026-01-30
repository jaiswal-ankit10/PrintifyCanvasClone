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
      front: {
        label: "Front",
        image: "/previews/hoodie/Front.png",
        usesSide: "front",
        printArea: {
          topOffset: 0,
          leftOffset: 0,
          rotation: 0,
        },
      },
      back: {
        label: "Back",
        image: "/previews/hoodie/Back.png",
        usesSide: "back",
        printArea: {
          topOffset: 0,
          leftOffset: 8,
          rotation: 0,
        },
      },
      folded: {
        label: "Folded",
        image: "/previews/hoodie/Folded.png",
        usesSide: "front",
        printArea: {
          topOffset: 70,
          leftOffset: -20,
          rotation: 15,
        },
      },
      person1: {
        label: "Person 1",
        image: "/previews/hoodie/Person1.png",
        usesSide: "front",
        printArea: {
          topOffset: 70,
          leftOffset: 0,
          rotation: 0,
        },
      },
      person2: {
        label: "Person 2",
        image: "/previews/hoodie/Person2.png",
        usesSide: "front",
        printArea: {
          topOffset: 70,
          leftOffset: 0,
          rotation: 0,
        },
      },
      person3: {
        label: "Person 3",
        image: "/previews/hoodie/Person3.png",
        usesSide: "front",
        printArea: {
          topOffset: 40,
          leftOffset: 0,
          rotation: 0,
        },
      },
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
      front: {
        label: "Front",
        image: "/previews/crewneck/Front.png",
        usesSide: "front",
        printArea: {
          topOffset: 0,
          leftOffset: 0,
          rotation: 0,
        },
      },
      back: {
        label: "Back",
        image: "/previews/crewneck/Back.png",
        usesSide: "back",
        printArea: {
          topOffset: 0,
          leftOffset: 0,
          rotation: 0,
        },
      },
      folded: {
        label: "Folded",
        image: "/previews/crewneck/Folded.png",
        usesSide: "front",
        printArea: {
          topOffset: 40,
          leftOffset: -5,
          rotation: 17,
        },
      },
      person1: {
        label: "Person 1",
        image: "/previews/crewneck/Person1.png",
        usesSide: "front",
        printArea: {
          topOffset: 20,
          leftOffset: 0,
          rotation: 0,
        },
      },
      person2: {
        label: "Person 2",
        image: "/previews/crewneck/Person2.png",
        usesSide: "front",
        printArea: {
          topOffset: 20,
          leftOffset: 0,
          rotation: 0,
        },
      },
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
      front: {
        label: "Front",
        image: "/previews/t-shirt/Front.png",
        usesSide: "front",
        printArea: {
          topOffset: 0,
          leftOffset: 0,
          rotation: 0,
        },
      },
      back: {
        label: "Back",
        image: "/previews/t-shirt/Back.png",
        usesSide: "back",
        printArea: {
          topOffset: 0,
          leftOffset: 0,
          rotation: 0,
        },
      },
      folded: {
        label: "Folded",
        image: "/previews/t-shirt/Folded.png",
        usesSide: "front",
        printArea: {
          topOffset: 0,
          leftOffset: 0,
          rotation: 18,
        },
      },
      person1Front: {
        label: "Person 1 (Front)",
        image: "/previews/t-shirt/Person1Front.png",
        usesSide: "front",
        printArea: {
          topOffset: 0,
          leftOffset: 0,
          rotation: 10,
        },
      },
      person1Back: {
        label: "Person 1 (Back)",
        image: "/previews/t-shirt/Person1Back.png",
        usesSide: "back",
        printArea: {
          topOffset: 0,
          leftOffset: 0,
          rotation: 0,
        },
      },
      person2: {
        label: "Person 2",
        image: "/previews/t-shirt/Person2.png",
        usesSide: "front",
        printArea: {
          topOffset: 0,
          leftOffset: 0,
          rotation: 0,
        },
      },
      person3Front: {
        label: "Person 3 (Front)",
        image: "/previews/t-shirt/Person3Front.png",
        usesSide: "front",
        printArea: {
          topOffset: 0,
          leftOffset: 0,
          rotation: 0,
        },
      },
      person3Back: {
        label: "Person 3 (Back)",
        image: "/previews/t-shirt/Person3Back.png",
        usesSide: "back",
        printArea: {
          topOffset: 0,
          leftOffset: 0,
          rotation: 0,
        },
      },
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
      mug: {
        label: "Mug",
        image: "/mockups/mug/mug.png",
        usesSide: "mug",
        printArea: {
          topOffset: 0,
          leftOffset: 0,
          rotation: 0,
        },
      },
    },
  },
];
