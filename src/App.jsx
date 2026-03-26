import { startTransition, useDeferredValue, useEffect, useState } from "react";

const STORAGE_KEY = "inventory-keeper-react-v1";
const ACTION_CHOICES = ["Store", "Sell", "Dispose"];
const STATUS_TABS = ["In Storage", "Returned", "To Sell", "To Dispose", "Sold", "Disposed", "Archive"];
const USER_STATUS_TABS = ["See all", ...STATUS_TABS];
const ADMIN_STATUS_TABS = ["See all", ...STATUS_TABS];
const RETURN_WINDOWS = ["Morning (8am-12pm)", "Afternoon (12pm-4pm)", "Evening (4pm-8pm)"];
const RETURN_OPTIONS = ["Cancel storage", "Return at a later date"];
const AUTO_ARCHIVE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
const SAMPLE_ITEM_IMAGES = {
  "item-1": makeIllustration({
    title: "Winter Coat",
    background: "#25334d",
    accent: "#f3f4f6",
    detail: "#93c5fd",
    body: `
      <path d="M154 92 126 74 98 92 88 150h22l8 92h16l6-82h12l6 82h16l8-92h22z"/>
      <path d="M126 74v168"/>
      <path d="M98 92 78 122"/>
      <path d="M154 92 174 122"/>
      <path d="M110 98h32"/>
    `,
  }),
  "item-2": makeIllustration({
    title: "Dining Table",
    background: "#4a3225",
    accent: "#f5f5f4",
    detail: "#d6b38a",
    body: `
      <rect x="54" y="88" width="144" height="26" rx="4"/>
      <path d="M72 114 62 214"/>
      <path d="M180 114 190 214"/>
      <path d="M102 114 94 214"/>
      <path d="M150 114 158 214"/>
      <path d="M62 214h132"/>
    `,
  }),
  "item-3": makeIllustration({
    title: "Children's Books",
    background: "#23403b",
    accent: "#f8fafc",
    detail: "#fca5a5",
    body: `
      <rect x="62" y="82" width="30" height="118" rx="4"/>
      <rect x="98" y="74" width="34" height="126" rx="4"/>
      <rect x="138" y="88" width="30" height="112" rx="4"/>
      <rect x="174" y="78" width="24" height="122" rx="4"/>
      <path d="M76 98h10M76 116h10M112 94h12M112 114h12M148 104h10M148 122h10M180 96h8M180 114h8"/>
    `,
  }),
  "item-4": makeIllustration({
    title: "Ski Boots",
    background: "#1f2937",
    accent: "#f9fafb",
    detail: "#fcd34d",
    body: `
      <path d="M62 150h54l18 24h26v24H78l-22-26z"/>
      <path d="M148 138h48l18 18v42h-72l-20-24z"/>
      <path d="M92 138v20M108 136v24M168 126v24M184 124v26"/>
      <path d="M56 198h108M122 198h94"/>
    `,
  }),
  "item-5": makeIllustration({
    title: "Ceramic Lamp",
    background: "#3d2b36",
    accent: "#faf5ff",
    detail: "#f9a8d4",
    body: `
      <path d="M126 66 84 118h84z"/>
      <path d="M126 118v44"/>
      <path d="M106 162h40"/>
      <path d="M94 194h64"/>
      <path d="M102 194v-18h48v18"/>
    `,
  }),
  "item-6": makeIllustration({
    title: "Acoustic Guitar",
    background: "#3f2a1c",
    accent: "#fff7ed",
    detail: "#fdba74",
    body: `
      <path d="M150 74v120"/>
      <path d="M136 76h28"/>
      <path d="M124 114c-18 0-28 14-28 34s14 34 34 34c22 0 34-12 34-30 0-10-6-18-14-24-6-4-10-14-10-14s-4 0-16 0z"/>
      <circle cx="138" cy="148" r="8"/>
      <path d="M150 86 166 100"/>
    `,
  }),
  "item-7": makeIllustration({
    title: "Record Crate",
    background: "#243447",
    accent: "#f8fafc",
    detail: "#93c5fd",
    body: `
      <rect x="62" y="98" width="128" height="88" rx="10"/>
      <path d="M82 86v100"/>
      <path d="M170 86v100"/>
      <path d="M94 84h64"/>
      <circle cx="126" cy="142" r="18"/>
      <circle cx="126" cy="142" r="4"/>
    `,
  }),
  "item-8": makeIllustration({
    title: "Bench Cushion Set",
    background: "#2f3f2b",
    accent: "#f7fee7",
    detail: "#bef264",
    body: `
      <rect x="56" y="112" width="140" height="34" rx="12"/>
      <rect x="64" y="82" width="42" height="28" rx="10"/>
      <rect x="110" y="82" width="42" height="28" rx="10"/>
      <rect x="156" y="82" width="32" height="28" rx="10"/>
      <path d="M76 112v34M122 112v34M166 112v34"/>
    `,
  }),
  "item-9": makeIllustration({
    title: "Floor Mirror",
    background: "#202834",
    accent: "#f8fafc",
    detail: "#cbd5e1",
    body: `
      <rect x="80" y="52" width="92" height="150" rx="14"/>
      <path d="M92 64h68v126H92z"/>
      <path d="M96 206 82 224"/>
      <path d="M156 206 170 224"/>
    `,
  }),
  "item-10": makeIllustration({
    title: "Coffee Table",
    background: "#4b3621",
    accent: "#fefce8",
    detail: "#fde68a",
    body: `
      <rect x="54" y="96" width="144" height="20" rx="4"/>
      <path d="M76 116 64 200"/>
      <path d="M176 116 188 200"/>
      <path d="M100 116 92 200"/>
      <path d="M152 116 160 200"/>
      <path d="M64 200h124"/>
    `,
  }),
  "item-11": makeIllustration({
    title: "Camping Lantern",
    background: "#2a3138",
    accent: "#f8fafc",
    detail: "#fde047",
    body: `
      <path d="M96 92h60"/>
      <path d="M108 92v-18h36v18"/>
      <rect x="88" y="92" width="76" height="104" rx="14"/>
      <path d="M102 116h48v46h-48z"/>
      <path d="M96 196h60"/>
    `,
  }),
  "item-12": makeIllustration({
    title: "Side Table",
    background: "#433226",
    accent: "#fafaf9",
    detail: "#d6d3d1",
    body: `
      <rect x="72" y="84" width="108" height="18" rx="4"/>
      <path d="M92 102 86 188"/>
      <path d="M160 102 166 188"/>
      <path d="M126 102v86"/>
      <path d="M82 188h88"/>
    `,
  }),
  "item-13": makeIllustration({
    title: "Area Rug",
    background: "#3b233a",
    accent: "#fdf2f8",
    detail: "#f9a8d4",
    body: `
      <rect x="48" y="74" width="156" height="108" rx="12"/>
      <path d="M68 94h116"/>
      <path d="M68 118h116"/>
      <path d="M68 142h116"/>
      <path d="M68 166h116"/>
      <path d="M58 182v18M74 182v18M90 182v18M106 182v18M122 182v18M138 182v18M154 182v18M170 182v18M186 182v18"/>
    `,
  }),
  "item-14": makeIllustration({
    title: "Patio Chairs",
    background: "#2a3e39",
    accent: "#f0fdf4",
    detail: "#86efac",
    body: `
      <path d="M78 92h32v34H78z"/>
      <path d="M78 126h32l8 42H70z"/>
      <path d="M86 168v28M104 168v28"/>
      <path d="M142 92h32v34h-32z"/>
      <path d="M142 126h32l8 42h-48z"/>
      <path d="M150 168v28M168 168v28"/>
    `,
  }),
  "item-15": makeIllustration({
    title: "Desk Chair",
    background: "#253040",
    accent: "#eff6ff",
    detail: "#93c5fd",
    body: `
      <path d="M102 84h48v38h-48z"/>
      <path d="M92 122h68l-10 32h-48z"/>
      <path d="M126 154v30"/>
      <path d="M96 184h60"/>
      <path d="M126 184 88 208"/>
      <path d="M126 184 164 208"/>
      <path d="M126 184v28"/>
    `,
  }),
  "item-16": makeIllustration({
    title: "Glass Vase Set",
    background: "#263445",
    accent: "#f8fafc",
    detail: "#7dd3fc",
    body: `
      <path d="M82 80h22v18l-6 18v56c0 12 10 22 22 22s22-10 22-22v-56l-6-18V80h22"/>
      <path d="M166 102h18v18l-5 16v38c0 12-8 20-18 20s-18-8-18-20v-38l-5-16v-18h18"/>
    `,
  }),
};

const seedData = {
  accounts: [
    {
      id: "user-1",
      name: "Maya Patel",
      role: "user",
      email: "maya@example.com",
      password: "Maya123!",
      clientSince: "2024-02-12",
    },
    {
      id: "user-2",
      name: "Jordan Lee",
      role: "user",
      email: "jordan@example.com",
      password: "Jordan123!",
      clientSince: "2023-09-08",
    },
    {
      id: "admin-1",
      name: "Riley Chen",
      role: "admin",
      email: "riley@example.com",
      password: "Admin123!",
      clientSince: "2023-01-15",
    },
  ],
  items: [
    {
      id: "item-1",
      ownerId: "user-1",
      name: "Winter Coat",
      category: "Clothing",
      description: "Navy wool coat stored for next season.",
      status: "In Storage",
      location: "Garage shelf A3",
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      image: SAMPLE_ITEM_IMAGES["item-1"],
      notifications: [],
      updatedAt: "2026-03-23T13:00:00.000Z",
    },
    {
      id: "item-2",
      ownerId: "user-1",
      name: "Dining Table",
      category: "Furniture",
      description: "Oak table marked for sale and ready for admin review.",
      status: "To Sell",
      location: "Garage staging area",
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      image: SAMPLE_ITEM_IMAGES["item-2"],
      notifications: [],
      updatedAt: "2026-03-22T15:30:00.000Z",
    },
    {
      id: "item-3",
      ownerId: "user-2",
      name: "Children's Books",
      category: "Books",
      description: "Boxed set marked to be given away.",
      status: "To Dispose",
      location: "Hall closet donation bin",
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      image: SAMPLE_ITEM_IMAGES["item-3"],
      notifications: [],
      updatedAt: "2026-03-21T18:15:00.000Z",
    },
    {
      id: "item-4",
      ownerId: "user-2",
      name: "Ski Boots",
      category: "Sports",
      description: "Stored with seasonal gear.",
      status: "In Storage",
      location: "Storage unit 14B",
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      image: SAMPLE_ITEM_IMAGES["item-4"],
      notifications: [],
      updatedAt: "2026-03-23T09:20:00.000Z",
    },
    {
      id: "item-5",
      ownerId: "user-1",
      name: "Ceramic Lamp",
      category: "Home Decor",
      description: "Table lamp packed for storage after the guest room refresh.",
      status: "In Storage",
      location: "Upper shelf C2",
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      image: SAMPLE_ITEM_IMAGES["item-5"],
      notifications: [],
      updatedAt: "2026-03-22T10:15:00.000Z",
    },
    {
      id: "item-6",
      ownerId: "user-1",
      name: "Acoustic Guitar",
      category: "Music",
      description: "Stored in a padded case with accessories for the studio move.",
      status: "In Storage",
      location: "Music locker 2",
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      image: SAMPLE_ITEM_IMAGES["item-6"],
      notifications: [],
      updatedAt: "2026-03-21T11:40:00.000Z",
    },
    {
      id: "item-7",
      ownerId: "user-1",
      name: "Record Crate",
      category: "Media",
      description: "Favorite vinyl collection boxed and labeled for safe storage.",
      status: "In Storage",
      location: "Media shelf B1",
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      image: SAMPLE_ITEM_IMAGES["item-7"],
      notifications: [],
      updatedAt: "2026-03-20T14:05:00.000Z",
    },
    {
      id: "item-8",
      ownerId: "user-1",
      name: "Bench Cushion Set",
      category: "Outdoor",
      description: "Patio cushions ready to be sold after redesigning the terrace.",
      status: "To Sell",
      location: "Staging shelf D4",
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      image: SAMPLE_ITEM_IMAGES["item-8"],
      notifications: [],
      updatedAt: "2026-03-19T16:50:00.000Z",
    },
    {
      id: "item-9",
      ownerId: "user-1",
      name: "Floor Mirror",
      category: "Furniture",
      description: "Tall mirror marked to sell after the bedroom renovation.",
      status: "To Sell",
      location: "Furniture aisle A6",
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      image: SAMPLE_ITEM_IMAGES["item-9"],
      notifications: [],
      updatedAt: "2026-03-18T09:30:00.000Z",
    },
    {
      id: "item-10",
      ownerId: "user-1",
      name: "Coffee Table",
      category: "Furniture",
      description: "Walnut coffee table added to the sell list after moving apartments.",
      status: "To Sell",
      location: "Furniture staging B3",
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      image: SAMPLE_ITEM_IMAGES["item-10"],
      notifications: [],
      updatedAt: "2026-03-17T13:10:00.000Z",
    },
    {
      id: "item-11",
      ownerId: "user-2",
      name: "Camping Lantern",
      category: "Outdoor",
      description: "Lantern packed with seasonal camping gear.",
      status: "In Storage",
      location: "Outdoor shelf E1",
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      image: SAMPLE_ITEM_IMAGES["item-11"],
      notifications: [],
      updatedAt: "2026-03-22T08:45:00.000Z",
    },
    {
      id: "item-12",
      ownerId: "user-2",
      name: "Side Table",
      category: "Furniture",
      description: "Small oak side table wrapped and stored after combining rooms.",
      status: "In Storage",
      location: "Unit 14B shelf 2",
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      image: SAMPLE_ITEM_IMAGES["item-12"],
      notifications: [],
      updatedAt: "2026-03-20T12:20:00.000Z",
    },
    {
      id: "item-13",
      ownerId: "user-2",
      name: "Area Rug",
      category: "Home Decor",
      description: "Rolled rug stored after updating the living room setup.",
      status: "In Storage",
      location: "Textile rack C1",
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      image: SAMPLE_ITEM_IMAGES["item-13"],
      notifications: [],
      updatedAt: "2026-03-19T10:55:00.000Z",
    },
    {
      id: "item-14",
      ownerId: "user-2",
      name: "Patio Chairs",
      category: "Outdoor",
      description: "Folding chairs marked to sell after replacing the patio set.",
      status: "To Sell",
      location: "Outdoor staging A2",
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      image: SAMPLE_ITEM_IMAGES["item-14"],
      notifications: [],
      updatedAt: "2026-03-18T17:25:00.000Z",
    },
    {
      id: "item-15",
      ownerId: "user-2",
      name: "Desk Chair",
      category: "Office",
      description: "Office chair listed to sell after the workspace upgrade.",
      status: "To Sell",
      location: "Office staging B5",
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      image: SAMPLE_ITEM_IMAGES["item-15"],
      notifications: [],
      updatedAt: "2026-03-17T15:05:00.000Z",
    },
    {
      id: "item-16",
      ownerId: "user-2",
      name: "Glass Vase Set",
      category: "Home Decor",
      description: "Decorative vases prepared for sale after decluttering the dining room.",
      status: "To Sell",
      location: "Fragile staging C4",
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      image: SAMPLE_ITEM_IMAGES["item-16"],
      notifications: [],
      updatedAt: "2026-03-16T14:30:00.000Z",
    },
  ],
};

const emptyForm = {
  name: "",
  category: "",
  description: "",
  status: "Store",
  image: "",
};

function App() {
  const [data, setData] = useState(loadState);
  const [sessionId, setSessionId] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("See all");
  const [selectedAdminOwner, setSelectedAdminOwner] = useState("all");
  const [draft, setDraft] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [formStep, setFormStep] = useState("upload");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedItemSource, setSelectedItemSource] = useState("inventory");
  const [selectedProfileId, setSelectedProfileId] = useState("");

  const deferredSearch = useDeferredValue(searchTerm);
  const session = data.accounts.find((account) => account.id === sessionId) ?? null;
  const userAccounts = data.accounts.filter((account) => account.role === "user");

  const sourceItems =
    session?.role === "admin"
      ? data.items
      : data.items.filter((item) => item.ownerId === session?.id);

  const ownerFilteredItems =
    session?.role === "admin" && selectedAdminOwner !== "all"
      ? sourceItems.filter((item) => item.ownerId === selectedAdminOwner)
      : sourceItems;

  const filteredItems = ownerFilteredItems.filter((item) => {
    const matchesStatus = selectedTab === "See all" ? true : item.status === selectedTab;
    const haystack = `${item.name} ${item.category} ${item.description} ${item.location}`.toLowerCase();
    const matchesSearch = haystack.includes(deferredSearch.trim().toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const tabCounts = buildTabCounts(ownerFilteredItems, true);
  const adminInboxItems = ownerFilteredItems
    .filter(
      (item) =>
        item.status === "To Sell" ||
        item.status === "To Dispose" ||
        (item.status === "In Storage" &&
          item.returnRequestWindow &&
          (item.returnRequestWindow === "Cancel storage" || item.returnRequestDate)),
    )
    .filter((item) => {
      const haystack = `${item.name} ${item.category} ${item.description} ${item.location}`.toLowerCase();
      return haystack.includes(deferredSearch.trim().toLowerCase());
    })
    .map((item) => ({
      ...item,
      ownerName: data.accounts.find((account) => account.id === item.ownerId)?.name ?? "Unknown user",
    }))
    .sort(sortItemsByUpdatedAt);

  useEffect(() => {
    const nextData = applyArchiveRules(data);

    if (nextData !== data) {
      setData(nextData);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
    }
  }, [data]);

  function commit(nextData) {
    const preparedData = applyArchiveRules(nextData);
    setData(preparedData);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preparedData));
  }

  function resetWorkspace() {
    setDraft(emptyForm);
    setEditingId("");
    setFormStep("upload");
    setSelectedItemId("");
    setSelectedItemSource("inventory");
    setSelectedProfileId("");
    startTransition(() => {
      setSearchTerm("");
      setSelectedTab("See all");
      setSelectedAdminOwner("all");
    });
  }

  function handleLogin(nextSessionId) {
    setSessionId(nextSessionId);
    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");
    resetWorkspace();
  }

  function handleLogout() {
    setSessionId("");
    setLoginPassword("");
    setLoginError("");
    resetWorkspace();
  }

  function handleLoginSubmit(event) {
    event.preventDefault();

    const email = loginEmail.trim().toLowerCase();
    const account = data.accounts.find(
      (entry) => entry.email.toLowerCase() === email && entry.password === loginPassword,
    );

    if (!account) {
      setLoginError("That email and password combination was not recognized.");
      return;
    }

    handleLogin(account.id);
  }

  function handleSearchChange(event) {
    const value = event.target.value;
    startTransition(() => setSearchTerm(value));
  }

  function handleDraftChange(event) {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function handleImageChange(event) {
    const [file] = event.target.files ?? [];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = typeof reader.result === "string" ? reader.result : "";
      setDraft((current) => ({
        ...current,
        image,
      }));

      if (image) {
        setFormStep("details");
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!session || session.role !== "user") {
      return;
    }

    const payload = {
      ...draft,
      name: draft.name.trim(),
      category: draft.category.trim(),
      description: draft.description.trim(),
      location:
        data.items.find((item) => item.id === editingId)?.location?.trim() || "Location to be assigned",
      image: draft.image,
      status: mapActionChoiceToStatus(draft.status),
      storageRequestDate: "",
      storageRequestWindow: "",
      returnRequestDate: "",
      returnRequestWindow: "",
      returnRequestType: "",
      completedAt: "",
      notifications: editingId
        ? data.items.find((item) => item.id === editingId)?.notifications ?? []
        : [],
      updatedAt: new Date().toISOString(),
    };

    if (!payload.name || !payload.category) {
      return;
    }

    if (editingId) {
      commit({
        ...data,
        items: data.items.map((item) => (item.id === editingId ? { ...item, ...payload } : item)),
      });
    } else {
      commit({
        ...data,
        items: [
          {
            id: crypto.randomUUID(),
            ownerId: session.id,
            ...payload,
          },
          ...data.items,
        ],
      });
    }

    setDraft(emptyForm);
    setEditingId("");
    setFormStep("upload");
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setFormStep("details");
    setSelectedItemId("");
    setDraft({
      name: item.name,
      category: item.category,
      description: item.description,
      status: mapStatusToActionChoice(item.status),
      image: item.image || "",
    });
  }

  function handleDelete(itemId) {
    commit({
      ...data,
      items: data.items.filter((item) => item.id !== itemId),
    });

    if (selectedItemId === itemId) {
      setSelectedItemId("");
      setSelectedItemSource("inventory");
    }

    if (editingId === itemId) {
      setEditingId("");
      setDraft(emptyForm);
    }
  }

  function handleQuickUpdate(itemId, field, value) {
    commit({
      ...data,
      items: data.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const nextItem = { ...item, [field]: value, updatedAt: new Date().toISOString() };

        if (field === "status" && value !== "In Storage") {
          nextItem.returnRequestDate = "";
          nextItem.returnRequestWindow = "";
          nextItem.storageRequestDate = "";
          nextItem.storageRequestWindow = "";
        }

        if (field === "status" && value !== "Returned") {
          nextItem.completedAt = "";

          if (value !== "In Storage") {
            nextItem.returnRequestType = "";
          }
        }

        return nextItem;
      }),
    });
  }

  function handleReturnRequest(itemId, returnRequestDate, returnRequestWindow) {
    const returnRequestType =
      returnRequestWindow === "Cancel storage" ? "cancel-storage" : "return-later";

    commit({
      ...data,
      items: data.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              returnRequestDate,
              returnRequestWindow,
              returnRequestType,
              notifications: [
                ...(item.notifications ?? []),
                returnRequestWindow === "Cancel storage"
                  ? "Return requested with cancel storage."
                  : `Return requested for ${formatRequestDate(returnRequestDate)} during ${returnRequestWindow}.`,
              ],
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    });
  }

  function handleStorageRequest(itemId, storageRequestDate, storageRequestWindow) {
    commit({
      ...data,
      items: data.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: "In Storage",
              storageRequestDate,
              storageRequestWindow,
              returnRequestDate: "",
              returnRequestWindow: "",
              returnRequestType: "",
              completedAt: "",
              notifications: [
                ...(item.notifications ?? []),
                `Storage requested for ${formatRequestDate(storageRequestDate)} during ${storageRequestWindow}.`,
              ],
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    });
  }

  function handleUserStatusChoice(itemId, actionChoice) {
    handleQuickUpdate(itemId, "status", mapActionChoiceToStatus(actionChoice));
  }

  function handleAdminActionChoice(itemId, actionChoice) {
    handleQuickUpdate(itemId, "status", mapActionChoiceToStatus(actionChoice));
  }

  function handleAdminStatusCompletion(itemId, nextStatus) {
    const messageByStatus = {
      Sold: "Your item was marked as sold.",
      Disposed: "Your item was marked as disposed.",
      Returned: "Your item was marked as returned to you.",
    };

    commit({
      ...data,
      items: data.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: nextStatus,
              returnRequestDate: nextStatus === "Returned" ? "" : item.returnRequestDate,
              returnRequestWindow: nextStatus === "Returned" ? "" : item.returnRequestWindow,
              returnRequestType: nextStatus === "Returned" ? item.returnRequestType : "",
              completedAt:
                nextStatus === "Returned" || nextStatus === "Sold" || nextStatus === "Disposed"
                  ? new Date().toISOString()
                  : item.completedAt,
              notifications: [
                ...(item.notifications ?? []),
                messageByStatus[nextStatus],
              ],
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    });
  }

  function handleCreateUser(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = `${formData.get("firstName") ?? ""} ${formData.get("lastName") ?? ""}`.trim();
    const email = `${formData.get("email") ?? ""}`.trim();

    if (!name || !email) {
      return;
    }

    const nextUser = {
      id: crypto.randomUUID(),
      name,
      email,
      role: "user",
      password: "Temp123!",
    };

    commit({
      ...data,
      accounts: [...data.accounts, nextUser],
    });

    event.currentTarget.reset();
  }

  function openItemDetail(itemId, source = "inventory") {
    setSelectedProfileId("");
    setSelectedItemId(itemId);
    setSelectedItemSource(source);
  }

  function closeItemDetail() {
    setSelectedItemId("");
    setSelectedItemSource("inventory");
  }

  function openProfileDetail(profileId) {
    setSelectedItemId("");
    setSelectedItemSource("inventory");
    setSelectedProfileId(profileId);
  }

  function closeProfileDetail() {
    setSelectedProfileId("");
  }

  const selectedItem =
    sourceItems.find((item) => item.id === selectedItemId) ??
    data.items.find((item) => item.id === selectedItemId) ??
    null;
  const detailItems = selectedItemSource === "inbox" ? adminInboxItems : filteredItems;
  const selectedItemIndex = detailItems.findIndex((item) => item.id === selectedItemId);
  const previousItemId = selectedItemIndex > 0 ? detailItems[selectedItemIndex - 1]?.id ?? "" : "";
  const nextItemId =
    selectedItemIndex >= 0 && selectedItemIndex < detailItems.length - 1
      ? detailItems[selectedItemIndex + 1]?.id ?? ""
      : "";
  const selectedProfile = userAccounts.find((account) => account.id === selectedProfileId) ?? null;
  const selectedProfileIndex = userAccounts.findIndex((account) => account.id === selectedProfileId);
  const previousProfileId =
    selectedProfileIndex > 0 ? userAccounts[selectedProfileIndex - 1]?.id ?? "" : "";
  const nextProfileId =
    selectedProfileIndex >= 0 && selectedProfileIndex < userAccounts.length - 1
      ? userAccounts[selectedProfileIndex + 1]?.id ?? ""
      : "";

  if (!session) {
    return (
      <div className="shell auth-shell">
        <section className="hero auth-hero">
          <div className="hero-copy">
            <div className="brand-mark" aria-label="Space logo">
              <span>Space.</span>
            </div>
            <p className="eyebrow">Space. Inventory</p>
            <h1>Track what is stored, what should be sold, and what should be given away.</h1>
            <p className="lead">
              Choose an account below to enter the app. Users manage their own items,
              and admins review requests from everyone.
            </p>
            <p className="hero-note">All you need is the right key.</p>
          </div>

          <div className="hero-panel login-panel">
            <div className="section-heading login-heading">
              <div>
                <p className="section-label">Login</p>
                <h2>Sign in</h2>
              </div>
            </div>

            <form className="login-form" onSubmit={handleLoginSubmit}>
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="name@example.com"
                />
              </label>

              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Enter password"
                />
              </label>

              {loginError ? <p className="login-error">{loginError}</p> : null}

              <button className="button primary" type="submit">
                Log in
              </button>
            </form>

            <div className="login-list">
              {data.accounts.map((account) => (
                <div key={account.id} className="login-card">
                  <span className="card-eyebrow">{account.role}</span>
                  <strong>{account.name}</strong>
                  <span>{account.email}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="shell">
      <section className="panel session-panel">
        <div className="session-panel__inner">
          <div className="session-card">
            <div>
              <p className="section-label">Space. Inventory</p>
              <h2>{session.name}</h2>
              <p className="section-note session-note">
                {session.role === "admin" ? "Administrator view" : "User view"}
              </p>
            </div>
            <button className="button ghost" type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>

        </div>
      </section>

      {session?.role === "user" ? (
        <div className="layout">
          <section className="panel workspace-panel workspace-panel--composer">
            <div className="section-heading">
              <div>
                <p className="section-label">User Workspace</p>
                <h2>{session.name}'s items</h2>
              </div>
              <p className="section-note">{filteredItems.length} visible</p>
            </div>

            <form className="item-form" onSubmit={handleSubmit}>
              <div className="step-badge-row">
                <span className={`step-badge ${formStep === "upload" ? "step-badge--active" : ""}`}>
                  1. Upload image
                </span>
                <span className={`step-badge ${formStep === "details" ? "step-badge--active" : ""}`}>
                  2. Review details
                </span>
              </div>

              {formStep === "upload" ? (
                <div className="upload-step">
                  <div className="notice-banner">
                    Start by uploading a photo. After that, you will be taken to a
                    separate details step where you can add the title and description.
                  </div>
                  <label className="field">
                    <span>Item image</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                  </label>
                  {draft.image ? (
                    <div className="image-preview">
                      <img src={draft.image} alt="Preview of uploaded item" />
                    </div>
                  ) : null}
                  {draft.image ? (
                    <div className="button-row">
                      <button
                        className="button primary"
                        type="button"
                        onClick={() => setFormStep("details")}
                      >
                        Continue to details
                      </button>
                      <button
                        className="button ghost"
                        type="button"
                        onClick={() => {
                          setDraft(emptyForm);
                        }}
                      >
                        Remove image
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <div className="notice-banner">
                    Add the item title and description, then finish the remaining details
                    before saving.
                  </div>

                  {draft.image ? (
                    <div className="image-preview">
                      <img src={draft.image} alt="Preview of uploaded item" />
                    </div>
                  ) : null}

                  <div className="form-grid">
                    <label className="field">
                      <span>Item name</span>
                      <input name="name" value={draft.name} onChange={handleDraftChange} />
                    </label>
                    <label className="field">
                      <span>Category</span>
                      <input name="category" value={draft.category} onChange={handleDraftChange} />
                    </label>
                    <label className="field field-wide">
                      <span>Description</span>
                      <textarea
                        name="description"
                        value={draft.description}
                        onChange={handleDraftChange}
                        rows="4"
                      />
                    </label>
                    <label className="field">
                      <span>Status</span>
                      <select name="status" value={draft.status} onChange={handleDraftChange}>
                        {ACTION_CHOICES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="notice-banner field">
                      Storage location is assigned and updated by the admin.
                    </div>
                  </div>

                  <div className="button-row">
                    <button className="button primary" type="submit">
                      {editingId ? "Save changes" : "Add item"}
                    </button>
                    <button
                      className="button ghost"
                      type="button"
                      onClick={() => setFormStep("upload")}
                    >
                      Back to image
                    </button>
                    {editingId ? (
                      <button
                        className="button ghost"
                        type="button"
                        onClick={() => {
                          setEditingId("");
                          setDraft(emptyForm);
                          setFormStep("upload");
                        }}
                      >
                        Cancel edit
                      </button>
                    ) : null}
                  </div>
                </>
              )}
            </form>
          </section>

          <section className="toolbar">
            <label className="field">
              <span>Search</span>
              <input
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search items, categories, or locations"
              />
            </label>
          </section>

          <section className="tab-row">
            {USER_STATUS_TABS.map((tab) => (
              <button
                key={tab}
                className={`tab-button ${selectedTab === tab ? "tab-button--active" : ""}`}
                type="button"
                onClick={() => setSelectedTab(tab)}
              >
                <span>{tab}</span>
                <span className="tab-count">{tabCounts[tab] ?? 0}</span>
              </button>
            ))}
          </section>

          <section className="panel workspace-panel workspace-panel--inventory">
            <div className="section-heading">
              <div>
                <p className="section-label">Inventory</p>
                <h2>Tracked items</h2>
              </div>
            </div>

            <div className="card-grid card-grid--compact">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  ownerName={session.name}
                  compact
                  onOpenDetail={() => openItemDetail(item.id, "inventory")}
                />
              ))}
              {!filteredItems.length ? (
                <EmptyState copy="No items match the current search or filter." />
              ) : null}
            </div>
          </section>
        </div>
      ) : (
        <div className="layout admin-layout">
          <section className="panel admin-panel admin-panel--inbox">
            <div className="section-heading">
              <div>
                <p className="section-label">Admin Inbox</p>
                <h2>Items needing action</h2>
              </div>
              <p className="section-note">{adminInboxItems.length} requests</p>
            </div>

            <div className="request-list request-list--compact">
              {adminInboxItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  ownerName={item.ownerName}
                  compact
                  onOpenDetail={() => openItemDetail(item.id, "inbox")}
                />
              ))}
              {!adminInboxItems.length ? (
                <EmptyState copy="No items need action right now." />
              ) : null}
            </div>
          </section>

          <section className="panel admin-panel admin-panel--overview">
            <div className="section-heading">
              <div>
                <p className="section-label">Admin Overview</p>
                <h2>All users and their items</h2>
              </div>
              <p className="section-note">{userAccounts.length} users</p>
            </div>

            <div className="admin-summary-grid">
              {userAccounts.map((account) => (
                <button
                  className="summary-card summary-card--compact"
                  key={account.id}
                  type="button"
                  onClick={() => openProfileDetail(account.id)}
                >
                  <p>{account.name}</p>
                  <strong>{data.items.filter((item) => item.ownerId === account.id).length} items</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="panel admin-panel admin-panel--users">
            <div className="section-heading">
              <div>
                <p className="section-label">Add user</p>
                <h2>Create a tracked account</h2>
              </div>
            </div>

            <form className="form-grid compact-form" onSubmit={handleCreateUser}>
              <label className="field">
                <span>First name</span>
                <input name="firstName" />
              </label>
              <label className="field">
                <span>Last name</span>
                <input name="lastName" />
              </label>
              <label className="field field-wide">
                <span>Email</span>
                <input name="email" type="email" />
              </label>
              <button className="button primary" type="submit">
                Add user
              </button>
            </form>
          </section>

          <section className="panel admin-panel admin-panel--inventory">
            <div className="section-heading">
              <div>
                <p className="section-label">Inventory</p>
                <h2>
                  {selectedAdminOwner === "all"
                    ? "All items"
                    : `${data.accounts.find((account) => account.id === selectedAdminOwner)?.name ?? "Selected user"}'s items`}
                </h2>
              </div>
              <p className="section-note">{filteredItems.length} visible</p>
            </div>

            <section className="toolbar inventory-toolbar">
              <label className="field">
                <span>Search</span>
                <input
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search items, categories, or locations"
                />
              </label>

              <label className="field">
                <span>Person</span>
                <select
                  value={selectedAdminOwner}
                  onChange={(event) => setSelectedAdminOwner(event.target.value)}
                >
                  <option value="all">Show all</option>
                  {userAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className="tab-row inventory-tabs">
              {ADMIN_STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  className={`tab-button ${selectedTab === tab ? "tab-button--active" : ""}`}
                  type="button"
                  onClick={() => setSelectedTab(tab)}
                >
                  <span>{tab}</span>
                  <span className="tab-count">{tabCounts[tab] ?? 0}</span>
                </button>
              ))}
            </section>

            <div className="card-grid card-grid--compact">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  ownerName={data.accounts.find((account) => account.id === item.ownerId)?.name ?? "Unknown user"}
                  compact
                  onOpenDetail={() => openItemDetail(item.id, "inventory")}
                />
              ))}
              {!filteredItems.length ? <EmptyState copy="No items match the current filters." /> : null}
            </div>
          </section>
        </div>
      )}

      {selectedItem ? (
        <div className="detail-overlay" role="dialog" aria-modal="true">
          <div className="detail-backdrop" onClick={closeItemDetail} />
          <div className="detail-sheet">
            <div className="detail-sheet__header">
              <div className="detail-sheet__nav">
                <button
                  className="button ghost detail-sheet__icon-button"
                  type="button"
                  onClick={() => previousItemId && setSelectedItemId(previousItemId)}
                  disabled={!previousItemId}
                  aria-label="Previous item"
                >
                  ←
                </button>
                <button
                  className="button ghost detail-sheet__icon-button"
                  type="button"
                  onClick={() => nextItemId && setSelectedItemId(nextItemId)}
                  disabled={!nextItemId}
                  aria-label="Next item"
                >
                  →
                </button>
              </div>
              <button
                className="button ghost detail-sheet__icon-button"
                type="button"
                onClick={closeItemDetail}
                aria-label="Close item details"
              >
                ×
              </button>
            </div>

            <ItemCard
              item={selectedItem}
              ownerName={
                data.accounts.find((account) => account.id === selectedItem.ownerId)?.name ??
                session.name
              }
              canManage={session.role === "user"}
              canAdminManage={session.role === "admin"}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onQuickUpdate={handleQuickUpdate}
              onUserStatusChoice={
                session.role === "admin" ? handleAdminActionChoice : handleUserStatusChoice
              }
              onReturnRequest={handleReturnRequest}
              onStorageRequest={handleStorageRequest}
              onAdminStatusCompletion={handleAdminStatusCompletion}
            />
          </div>
        </div>
      ) : null}

      {selectedProfile ? (
        <div className="detail-overlay" role="dialog" aria-modal="true">
          <div className="detail-backdrop" onClick={closeProfileDetail} />
          <div className="detail-sheet">
            <div className="detail-sheet__header">
              <div className="detail-sheet__nav">
                <button
                  className="button ghost detail-sheet__icon-button"
                  type="button"
                  onClick={() => previousProfileId && setSelectedProfileId(previousProfileId)}
                  disabled={!previousProfileId}
                  aria-label="Previous profile"
                >
                  ←
                </button>
                <button
                  className="button ghost detail-sheet__icon-button"
                  type="button"
                  onClick={() => nextProfileId && setSelectedProfileId(nextProfileId)}
                  disabled={!nextProfileId}
                  aria-label="Next profile"
                >
                  →
                </button>
              </div>
              <button
                className="button ghost detail-sheet__icon-button"
                type="button"
                onClick={closeProfileDetail}
                aria-label="Close profile details"
              >
                ×
              </button>
            </div>

            <article className="profile-detail">
              <p className="section-label">User Profile</p>
              <h2>{selectedProfile.name}</h2>
              <dl className="meta-grid">
                <div>
                  <dt>Email</dt>
                  <dd>{selectedProfile.email}</dd>
                </div>
                <div>
                  <dt>Items</dt>
                  <dd>{data.items.filter((item) => item.ownerId === selectedProfile.id).length}</dd>
                </div>
                <div>
                  <dt>Client Since</dt>
                  <dd>{formatDate(selectedProfile.clientSince)}</dd>
                </div>
                <div>
                  <dt>Client Length</dt>
                  <dd>{formatClientLength(selectedProfile.clientSince)}</dd>
                </div>
              </dl>
            </article>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ItemCard({
  item,
  ownerName,
  compact,
  onOpenDetail,
  canManage,
  canAdminManage,
  onDelete,
  onEdit,
  onQuickUpdate,
  onUserStatusChoice,
  onReturnRequest,
  onStorageRequest,
  onAdminStatusCompletion,
}) {
  const currentActionChoice = mapStatusToActionChoice(item.status);
  const canUserManageActions = canManage && item.status !== "Archive";
  const availableStatusActions =
    item.status === "Returned"
      ? ACTION_CHOICES
      : ACTION_CHOICES.filter((status) => status !== currentActionChoice);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [showStorageForm, setShowStorageForm] = useState(false);
  const [showActionLog, setShowActionLog] = useState(false);
  const [returnMode, setReturnMode] = useState("");
  const [returnDate, setReturnDate] = useState(item.returnRequestDate ?? "");
  const [returnWindow, setReturnWindow] = useState(item.returnRequestWindow ?? "");
  const [storageDate, setStorageDate] = useState(item.storageRequestDate ?? "");
  const [storageWindow, setStorageWindow] = useState(item.storageRequestWindow ?? "");
  const adminCanChangeStatus = !["Sold", "Disposed", "Archive"].includes(item.status);
  const adminStatusButtons = adminCanChangeStatus
    ? ACTION_CHOICES.flatMap((status) => {
    const buttons = [];
    const isCurrentChoice = currentActionChoice === status;

    if (
      !(item.status === "To Dispose" && status === "Dispose") &&
      !(item.status === "To Sell" && status === "Sell") &&
      !(item.status === "In Storage" && status === "Store")
    ) {
      buttons.push({
        key: `admin-${item.id}-${status}`,
        label: status,
        className: isCurrentChoice ? "button ghost" : "button secondary",
        onClick: () => onUserStatusChoice(item.id, status),
      });
    }

    return buttons;
      })
    : [];

  function submitReturnRequest() {
    if (returnMode === "Cancel storage") {
      onReturnRequest(item.id, "", "Cancel storage");
      setShowReturnForm(false);
      setReturnMode("");
      setReturnDate("");
      setReturnWindow("");
      return;
    }

    if (!returnDate || !returnWindow) {
      return;
    }

    onReturnRequest(item.id, returnDate, returnWindow);
    setShowReturnForm(false);
    setReturnMode("");
  }

  function submitStorageRequest() {
    if (!storageDate || !storageWindow) {
      return;
    }

    onStorageRequest(item.id, storageDate, storageWindow);
    setShowStorageForm(false);
  }

  if (compact) {
    return (
      <button className="item-card item-card--compact" type="button" onClick={onOpenDetail}>
        {item.image ? (
          <div className="item-image-wrap item-image-wrap--compact">
            <img className="item-image" src={item.image} alt={`${item.name}`} />
          </div>
        ) : (
          <div className="item-image-placeholder item-image-placeholder--compact">No image</div>
        )}

        <div className="item-top item-top--compact">
          <div>
            <p className="card-eyebrow">{ownerName}</p>
            <h3>{item.name}</h3>
          </div>
          <span className={`status-tag ${statusClass(item.status)}`}>{item.status}</span>
        </div>
      </button>
    );
  }

  return (
    <article className="item-card">
      {item.image ? (
        <div className="item-image-wrap">
          <img className="item-image" src={item.image} alt={`${item.name}`} />
        </div>
      ) : (
        <div className="item-image-placeholder">No image</div>
      )}

      <div className="item-top">
        <div>
          <p className="card-eyebrow">{ownerName}</p>
          <h3>{item.name}</h3>
        </div>
        <div className="status-stack">
          <span className={`status-tag ${statusClass(item.status)}`}>{item.status}</span>
          {canAdminManage && item.status === "To Dispose" ? (
            <button
              className="button primary status-stack__action"
              type="button"
              onClick={() => onAdminStatusCompletion(item.id, "Disposed")}
            >
              Disposed
            </button>
          ) : null}
          {canAdminManage && item.status === "To Sell" ? (
            <button
              className="button primary status-stack__action"
              type="button"
              onClick={() => onAdminStatusCompletion(item.id, "Sold")}
            >
              Sold
            </button>
          ) : null}
        </div>
      </div>

      <p className="item-description">{item.description || "No description added yet."}</p>

      <dl className="meta-grid">
        <div>
          <dt>Category</dt>
          <dd>{item.category}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{item.location}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatDate(item.updatedAt)}</dd>
        </div>
      </dl>

      {item.status === "In Storage" && item.returnRequestWindow ? (
        <div className="return-summary">
          <strong>Return requested</strong>
          <p>
            {item.returnRequestWindow === "Cancel storage"
              ? "Cancel storage"
              : `${formatRequestDate(item.returnRequestDate)} during ${item.returnRequestWindow}`}
          </p>
        </div>
      ) : null}

      {item.status === "In Storage" && item.storageRequestDate && item.storageRequestWindow ? (
        <div className="return-summary">
          <strong>Storage scheduled</strong>
          <p>
            {formatRequestDate(item.storageRequestDate)} during {item.storageRequestWindow}
          </p>
        </div>
      ) : null}

      {item.notifications?.length ? (
        <div className="activity-log">
          <button
            className="activity-log__toggle"
            type="button"
            onClick={() => setShowActionLog((current) => !current)}
            aria-expanded={showActionLog}
          >
            <span>Action log</span>
            <span className={`activity-log__arrow ${showActionLog ? "activity-log__arrow--open" : ""}`}>
              ▾
            </span>
          </button>

          {showActionLog ? (
            <div className="activity-log__body">
              {item.notifications
                .slice()
                .reverse()
                .map((entry, index) => (
                  <p key={`${item.id}-log-${index}`}>{entry}</p>
                ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {canUserManageActions ? (
        <>
          <div className="field">
            <span>Change item status</span>
            <div className="status-action-row">
              {availableStatusActions.map((status) => (
                <button
                  key={status}
                  className="button secondary"
                  type="button"
                  onClick={() => {
                    if (item.status === "Returned" && status === "Store") {
                      setShowStorageForm((current) => !current);
                      return;
                    }

                    onUserStatusChoice(item.id, status);
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="button-row">
            {item.status === "In Storage" ? (
              <button
                className="button secondary"
                type="button"
                onClick={() => {
                  setShowReturnForm((current) => !current);
                  setReturnMode("");
                }}
              >
                Return to me
              </button>
            ) : null}
            <button className="button ghost" type="button" onClick={() => onDelete(item.id)}>
              Delete
            </button>
          </div>

          {item.status === "In Storage" && showReturnForm ? (
            <div className="return-form">
              <label className="field">
                <span>What would you like to do?</span>
                <select
                  value={returnMode}
                  onChange={(event) => setReturnMode(event.target.value)}
                >
                  <option value="">Select an option</option>
                  {RETURN_OPTIONS.map((optionLabel) => (
                    <option key={optionLabel} value={optionLabel}>
                      {optionLabel}
                    </option>
                  ))}
                </select>
              </label>

              {returnMode === "Return at a later date" ? (
                <>
                  <label className="field">
                    <span>Preferred date</span>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(event) => setReturnDate(event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Time window</span>
                    <select
                      value={returnWindow}
                      onChange={(event) => setReturnWindow(event.target.value)}
                    >
                      <option value="">Select a time window</option>
                      {RETURN_WINDOWS.map((windowLabel) => (
                        <option key={windowLabel} value={windowLabel}>
                          {windowLabel}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : null}

              <div className="button-row">
                <button className="button primary" type="button" onClick={submitReturnRequest}>
                  {returnMode === "Cancel storage" ? "Confirm return request" : "Save return request"}
                </button>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => {
                    setShowReturnForm(false);
                    setReturnMode("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {item.status === "Returned" && showStorageForm ? (
            <div className="return-form">
              <label className="field">
                <span>Preferred storage date</span>
                <input
                  type="date"
                  value={storageDate}
                  onChange={(event) => setStorageDate(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Time window</span>
                <select
                  value={storageWindow}
                  onChange={(event) => setStorageWindow(event.target.value)}
                >
                  <option value="">Select a time window</option>
                  {RETURN_WINDOWS.map((windowLabel) => (
                    <option key={windowLabel} value={windowLabel}>
                      {windowLabel}
                    </option>
                  ))}
                </select>
              </label>
              <div className="button-row">
                <button className="button primary" type="button" onClick={submitStorageRequest}>
                  Save storage request
                </button>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => setShowStorageForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {canAdminManage && item.status !== "Archive" ? (
        <>
          <div className="form-grid compact-form">
            <label className="field">
              <span>Storage location</span>
              <input
                defaultValue={item.location}
                onBlur={(event) => {
                  const value = event.target.value.trim() || "Unknown location";
                  if (value !== item.location) {
                    onQuickUpdate(item.id, "location", value);
                  }
                }}
              />
            </label>
          </div>

          {adminStatusButtons.length ? (
            <div className="field">
              <span>Change item status</span>
              <div className="status-action-row">
                {adminStatusButtons.map((button) => (
                  <button
                    key={button.key}
                    className={button.className}
                    type="button"
                    onClick={button.onClick}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="button-row">
            <button className="button secondary" type="button" onClick={() => onEdit(item)}>
              Edit
            </button>
            {item.status === "In Storage" &&
            item.returnRequestWindow &&
            (item.returnRequestWindow === "Cancel storage" || item.returnRequestDate) ? (
              <button
                className="button primary"
                type="button"
                onClick={() => onAdminStatusCompletion(item.id, "Returned")}
              >
                Returned
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </article>
  );
}

function EmptyState({ copy }) {
  return (
    <div className="empty-state">
      <h3>Nothing to show</h3>
      <p>{copy}</p>
    </div>
  );
}

function buildCounts(items) {
  return items.reduce(
    (summary, item) => {
      summary.total += 1;

      if (item.status === "In Storage") {
        summary.inStorage += 1;
      } else if (item.status === "Returned") {
        summary.returned += 1;
      } else if (item.status === "To Sell") {
        summary.toSell += 1;
      } else if (item.status === "To Dispose") {
        summary.toDispose += 1;
      } else if (item.status === "Sold") {
        summary.sold += 1;
      } else if (item.status === "Disposed") {
        summary.disposed += 1;
      } else if (item.status === "Archive") {
        summary.archive += 1;
      }

      return summary;
    },
    { total: 0, inStorage: 0, returned: 0, toSell: 0, toDispose: 0, sold: 0, disposed: 0, archive: 0 },
  );
}

function buildTabCounts(items, includeAllOption = false) {
  const seedCounts = Object.fromEntries(STATUS_TABS.map((status) => [status, 0]));
  const baseCounts = includeAllOption ? { "See all": items.length, ...seedCounts } : seedCounts;

  return items.reduce(
    (summary, item) => ({
      ...summary,
      [item.status]: (summary[item.status] ?? 0) + 1,
    }),
    baseCounts,
  );
}

function loadState() {
  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return seedData;
  }

  try {
    const parsed = applyArchiveRules(JSON.parse(saved));
    const savedItems = (parsed.items ?? []).map((item) => ({
      ...item,
      image: item.image || SAMPLE_ITEM_IMAGES[item.id] || "",
      notifications: item.notifications ?? [],
      returnRequestDate: item.returnRequestDate ?? "",
      returnRequestWindow: item.returnRequestWindow ?? "",
      returnRequestType: item.returnRequestType ?? "",
      completedAt: item.completedAt ?? item.returnedCompletedAt ?? "",
      storageRequestDate: item.storageRequestDate ?? "",
      storageRequestWindow: item.storageRequestWindow ?? "",
      status: normalizeStatus(item.status),
    }));
    const missingSeedItems = seedData.items.filter(
      (seedItem) => !savedItems.some((item) => item.id === seedItem.id),
    );

    return {
      ...parsed,
      accounts: (parsed.accounts ?? seedData.accounts).map((account) => ({
        ...account,
        password: account.password ?? seedData.accounts.find((seed) => seed.id === account.id)?.password ?? "Temp123!",
        clientSince:
          account.clientSince ??
          seedData.accounts.find((seed) => seed.id === account.id)?.clientSince ??
          "2024-01-01",
      })),
      items: [...savedItems, ...missingSeedItems],
    };
  } catch {
    return seedData;
  }
}

function makeIllustration({ title, background, accent, detail, body }) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 252 252" role="img" aria-label="${title}">
      <rect width="252" height="252" rx="28" fill="${background}"/>
      <circle cx="196" cy="58" r="34" fill="${detail}" opacity="0.22"/>
      <circle cx="58" cy="194" r="42" fill="${detail}" opacity="0.16"/>
      <g fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
        ${body}
      </g>
      <rect x="24" y="24" width="204" height="204" rx="24" fill="none" stroke="${accent}" stroke-opacity="0.16"/>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatRequestDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatClientLength(value) {
  const start = new Date(`${value}T12:00:00`);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0) {
    return `${months || 1} month${months === 1 ? "" : "s"}`;
  }

  if (months === 0) {
    return `${years} year${years === 1 ? "" : "s"}`;
  }

  return `${years} year${years === 1 ? "" : "s"}, ${months} month${months === 1 ? "" : "s"}`;
}

function statusClass(status) {
  return `status-${status.toLowerCase().replace(/\s+/g, "-")}`;
}

function normalizeStatus(status) {
  if (status === "Sold") {
    return "Sold";
  }

  if (status === "Disposed") {
    return "Disposed";
  }

  if (status === "In Storage") {
    return "In Storage";
  }

  if (status === "Returned") {
    return "Returned";
  }

  if (status === "Archive") {
    return "Archive";
  }

  if (status === "Sell" || status === "To Sell") {
    return "To Sell";
  }

  if (status === "Dispose" || status === "To Dispose" || status === "Given Away") {
    return "To Dispose";
  }

  if (status === "Store") {
    return "In Storage";
  }

  return STATUS_TABS.includes(status) ? status : "In Storage";
}

function applyArchiveRules(data) {
  let hasChanges = false;

  const items = (data.items ?? []).map((item) => {
    if (
      item.completedAt &&
      Date.now() - new Date(item.completedAt).getTime() >= AUTO_ARCHIVE_AFTER_MS &&
      ((item.status === "Returned" && item.returnRequestType === "cancel-storage") ||
        item.status === "Sold" ||
        item.status === "Disposed")
    ) {
      hasChanges = true;
      return {
        ...item,
        status: "Archive",
        notifications: [
          ...(item.notifications ?? []),
          item.status === "Returned"
            ? "Item moved to archive after one week in returned status."
            : `Item moved to archive after one week in ${item.status.toLowerCase()} status.`,
        ],
        updatedAt: new Date().toISOString(),
      };
    }

    return item;
  });

  return hasChanges ? { ...data, items } : data;
}

function sortItemsByUpdatedAt(left, right) {
  return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
}

function mapActionChoiceToStatus(actionChoice) {
  if (actionChoice === "Sell") {
    return "To Sell";
  }

  if (actionChoice === "Dispose") {
    return "To Dispose";
  }

  return "In Storage";
}

function mapStatusToActionChoice(status) {
  if (status === "To Sell" || status === "Sold") {
    return "Sell";
  }

  if (status === "To Dispose" || status === "Disposed") {
    return "Dispose";
  }

  return "Store";
}

export default App;
