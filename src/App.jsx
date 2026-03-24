import { startTransition, useDeferredValue, useState } from "react";

const STORAGE_KEY = "inventory-keeper-react-v1";
const STATUSES = ["In Storage", "To Sell", "To Give Away"];

const seedData = {
  accounts: [
    {
      id: "user-1",
      name: "Maya Patel",
      role: "user",
      email: "maya@example.com",
      password: "Maya123!",
    },
    {
      id: "user-2",
      name: "Jordan Lee",
      role: "user",
      email: "jordan@example.com",
      password: "Jordan123!",
    },
    {
      id: "admin-1",
      name: "Riley Chen",
      role: "admin",
      email: "riley@example.com",
      password: "Admin123!",
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
      updatedAt: "2026-03-22T15:30:00.000Z",
    },
    {
      id: "item-3",
      ownerId: "user-2",
      name: "Children's Books",
      category: "Books",
      description: "Boxed set marked to be given away.",
      status: "To Give Away",
      location: "Hall closet donation bin",
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
      updatedAt: "2026-03-23T09:20:00.000Z",
    },
  ],
};

const emptyForm = {
  name: "",
  category: "",
  description: "",
  status: "In Storage",
  location: "",
  image: "",
};

function App() {
  const [data, setData] = useState(loadState);
  const [sessionId, setSessionId] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [draft, setDraft] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");

  const deferredSearch = useDeferredValue(searchTerm);
  const session = data.accounts.find((account) => account.id === sessionId) ?? null;
  const userAccounts = data.accounts.filter((account) => account.role === "user");

  const sourceItems =
    session?.role === "admin"
      ? data.items
      : data.items.filter((item) => item.ownerId === session?.id);

  const filteredItems = sourceItems.filter((item) => {
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const haystack = `${item.name} ${item.category} ${item.description} ${item.location}`.toLowerCase();
    const matchesSearch = haystack.includes(deferredSearch.trim().toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const groupedAdminItems = userAccounts.map((account) => ({
    account,
    items: filteredItems
      .filter((item) => item.ownerId === account.id)
      .sort(sortItemsByUpdatedAt),
  }));

  const counts = buildCounts(data.items);
  const adminActionItems = filteredItems
    .filter((item) => item.status !== "In Storage")
    .map((item) => ({
      ...item,
      ownerName: data.accounts.find((account) => account.id === item.ownerId)?.name ?? "Unknown user",
    }))
    .sort(sortItemsByUpdatedAt);

  function commit(nextData) {
    setData(nextData);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
  }

  function resetWorkspace() {
    setDraft(emptyForm);
    setEditingId("");
    startTransition(() => {
      setSearchTerm("");
      setStatusFilter("All");
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
      setDraft((current) => ({
        ...current,
        image: typeof reader.result === "string" ? reader.result : "",
      }));
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
      location: draft.location.trim(),
      image: draft.image,
      updatedAt: new Date().toISOString(),
    };

    if (!payload.name || !payload.category || !payload.location) {
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
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setDraft({
      name: item.name,
      category: item.category,
      description: item.description,
      status: item.status,
      location: item.location,
      image: item.image ?? "",
    });
  }

  function handleDelete(itemId) {
    commit({
      ...data,
      items: data.items.filter((item) => item.id !== itemId),
    });

    if (editingId === itemId) {
      setEditingId("");
      setDraft(emptyForm);
    }
  }

  function handleQuickUpdate(itemId, field, value) {
    commit({
      ...data,
      items: data.items.map((item) =>
        item.id === itemId
          ? { ...item, [field]: value, updatedAt: new Date().toISOString() }
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
      <section className="hero">
        <div className="hero-copy">
          <div className="brand-mark brand-mark--small" aria-hidden="true">
            <span>Space.</span>
          </div>
          <p className="eyebrow">Space. Inventory</p>
          <h1>Track where every physical item is, and what happens to it next.</h1>
          <p className="lead">
            Users manage their own belongings. Admins oversee all users and every
            item in one place, including requests to sell or give things away.
          </p>
          <p className="hero-note">Built around visibility, organization, and next actions.</p>
        </div>

        <div className="hero-panel">
          <div className="session-card">
            <div>
              <p className="section-label">Signed in</p>
              <h2>{session.name}</h2>
              <p className="section-note session-note">
                {session.role === "admin" ? "Administrator view" : "User view"}
              </p>
            </div>
            <button className="button ghost" type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>

          <div className="pill-row">
            <span className="pill">{counts.total} total items</span>
            <span className="pill">{counts.storage} in storage</span>
            <span className="pill">{counts.toSell} marked to sell</span>
            <span className="pill">{counts.toGiveAway} marked to give away</span>
          </div>
        </div>
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

        <label className="field">
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </section>

      {session?.role === "user" ? (
        <div className="layout">
          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="section-label">User Workspace</p>
                <h2>{session.name}'s items</h2>
              </div>
              <p className="section-note">{filteredItems.length} visible</p>
            </div>

            <form className="item-form" onSubmit={handleSubmit}>
              <div className="notice-banner">
                Choosing <strong>To Sell</strong> or <strong>To Give Away</strong> lets the
                admin know what should happen next for that item.
              </div>

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
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Current location</span>
                  <input name="location" value={draft.location} onChange={handleDraftChange} />
                </label>
                <label className="field field-wide">
                  <span>Item image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>

              {draft.image ? (
                <div className="image-preview">
                  <img src={draft.image} alt="Preview of uploaded item" />
                </div>
              ) : null}

              <div className="button-row">
                <button className="button primary" type="submit">
                  {editingId ? "Save changes" : "Add item"}
                </button>
                {editingId ? (
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => {
                      setEditingId("");
                      setDraft(emptyForm);
                    }}
                  >
                    Cancel edit
                  </button>
                ) : null}
                {draft.image ? (
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => setDraft((current) => ({ ...current, image: "" }))}
                  >
                    Remove image
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="section-label">Inventory</p>
                <h2>Tracked items</h2>
              </div>
            </div>

            <div className="card-grid">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  ownerName={session.name}
                  canManage
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onQuickUpdate={handleQuickUpdate}
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
          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="section-label">Admin Inbox</p>
                <h2>Items needing action</h2>
              </div>
              <p className="section-note">{adminActionItems.length} requests</p>
            </div>

            <div className="request-list">
              {adminActionItems.map((item) => (
                <article className="request-row" key={item.id}>
                  <div className="request-main">
                    <p className="card-eyebrow">{item.ownerName}</p>
                    <h3>{item.name}</h3>
                    <p className="item-description">
                      {item.description || "No extra details added."}
                    </p>
                  </div>
                  <div className="request-meta">
                    <span className={`status-tag ${statusClass(item.status)}`}>{item.status}</span>
                    <p>
                      <strong>Location:</strong> {item.location}
                    </p>
                    <p>
                      <strong>Updated:</strong> {formatDate(item.updatedAt)}
                    </p>
                  </div>
                </article>
              ))}
              {!adminActionItems.length ? (
                <EmptyState copy="No items are currently marked to sell or give away." />
              ) : null}
            </div>
          </section>

          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="section-label">Admin Overview</p>
                <h2>All users and their items</h2>
              </div>
              <p className="section-note">{userAccounts.length} users</p>
            </div>

            <div className="admin-summary-grid">
              {groupedAdminItems.map(({ account, items }) => (
                <article className="summary-card" key={account.id}>
                  <p>{account.name}</p>
                  <strong>{items.length} items</strong>
                  <span>{account.email}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
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

          {groupedAdminItems.map(({ account, items }) => (
            <section className="panel" key={account.id}>
              <div className="section-heading">
                <div>
                  <p className="section-label">User</p>
                  <h2>{account.name}</h2>
                </div>
                <p className="section-note">{items.length} visible</p>
              </div>

              <div className="card-grid">
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    ownerName={account.name}
                    canManage={false}
                  />
                ))}
                {!items.length ? <EmptyState copy="No items match the current filters." /> : null}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, ownerName, canManage, onDelete, onEdit, onQuickUpdate }) {
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
        <span className={`status-tag ${statusClass(item.status)}`}>{item.status}</span>
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

      {canManage ? (
        <>
          <div className="form-grid compact-form">
            <label className="field">
              <span>Quick status</span>
              <select
                value={item.status}
                onChange={(event) => onQuickUpdate(item.id, "status", event.target.value)}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Quick location</span>
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

          <div className="button-row">
            <button className="button secondary" type="button" onClick={() => onEdit(item)}>
              Edit
            </button>
            <button className="button ghost" type="button" onClick={() => onDelete(item.id)}>
              Delete
            </button>
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
        summary.storage += 1;
      } else if (item.status === "To Sell") {
        summary.toSell += 1;
      } else if (item.status === "To Give Away") {
        summary.toGiveAway += 1;
      }

      return summary;
    },
    { total: 0, storage: 0, toSell: 0, toGiveAway: 0 },
  );
}

function loadState() {
  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return seedData;
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      ...parsed,
      accounts: (parsed.accounts ?? seedData.accounts).map((account) => ({
        ...account,
        password: account.password ?? seedData.accounts.find((seed) => seed.id === account.id)?.password ?? "Temp123!",
      })),
      items: (parsed.items ?? []).map((item) => ({
        ...item,
        image: item.image ?? "",
        status: normalizeStatus(item.status),
      })),
    };
  } catch {
    return seedData;
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function statusClass(status) {
  return `status-${status.toLowerCase().replace(/\s+/g, "-")}`;
}

function normalizeStatus(status) {
  if (status === "Sold") {
    return "To Sell";
  }

  if (status === "Given Away") {
    return "To Give Away";
  }

  return STATUSES.includes(status) ? status : "In Storage";
}

function sortItemsByUpdatedAt(left, right) {
  return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
}

export default App;
