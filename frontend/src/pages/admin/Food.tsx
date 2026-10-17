import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';

import {
  createFoodItem,
  getAdminFoodItems,
  getFoodImageUrl,
  hideFoodItem,
  restoreFoodItem,
  updateFoodItem,
} from '../../api/food';

import type {
  IFoodFormValues,
  IFoodItem,
} from '../../types';

const EMPTY_FORM: IFoodFormValues = {
  name: '',
  description: '',
  price: '',
  category: '',
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60';

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export default function Food() {
  const [items, setItems] = useState<IFoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState<
    'all' | 'available' | 'hidden'
  >('all');

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IFoodItem | null>(
    null
  );
  const [form, setForm] = useState<IFoodFormValues>({
    ...EMPTY_FORM,
  });
  const [image, setImage] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLElement>(null);
  const latestRequest = useRef(0);
  const mutationInProgress = useRef(false);

  const loadItems = useCallback(async () => {
    const requestId = ++latestRequest.current;

    setLoading(true);
    setError(null);

    try {
      const response = await getAdminFoodItems();

      if (requestId === latestRequest.current) {
        setItems(response.data);
      }
    } catch (err: unknown) {
      if (requestId === latestRequest.current) {
        setError(
          getErrorMessage(err, 'Failed to load food items')
        );
      }
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadItems();

    return () => {
      latestRequest.current += 1;
    };
  }, [loadItems]);

  useEffect(() => {
    if (editorOpen) {
      editorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [editorOpen, editingItem]);

  const resetEditor = () => {
    setEditorOpen(false);
    setEditingItem(null);
    setForm({ ...EMPTY_FORM });
    setImage(null);
    setFormError(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const openCreateEditor = () => {
    setEditingItem(null);
    setForm({ ...EMPTY_FORM });
    setImage(null);
    setFormError(null);
    setError(null);
    setSuccess(null);
    setEditorOpen(true);

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const openEditEditor = (item: IFoodItem) => {
    setEditingItem(item);

    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
    });

    setImage(null);
    setFormError(null);
    setError(null);
    setSuccess(null);
    setEditorOpen(true);

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (mutationInProgress.current) {
      return;
    }

    setFormError(null);

    const name = form.name.trim();
    const description = form.description.trim();
    const category = form.category.trim();
    const price = Number(form.price);

    if (!name || !description || !category) {
      setFormError(
        'Name, description, and category are required.'
      );
      return;
    }

    if (
      !form.price.trim() ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setFormError('Enter a valid non-negative price.');
      return;
    }

    if (!editingItem && !image) {
      setFormError('Choose an image for the new food item.');
      return;
    }

    const formData = new FormData();

    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', String(price));
    formData.append('category', category);

    if (image) {
      formData.append('image', image);
    }

    mutationInProgress.current = true;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = editingItem
        ? await updateFoodItem(editingItem._id, formData)
        : await createFoodItem(formData);

      const savedItem = response.data;

      setItems((currentItems) =>
        editingItem
          ? currentItems.map((item) =>
              item._id === savedItem._id ? savedItem : item
            )
          : [savedItem, ...currentItems]
      );

      setSuccess(
        editingItem
          ? 'Food item updated successfully.'
          : 'Food item created successfully.'
      );

      resetEditor();
    } catch (err: unknown) {
      setFormError(
        getErrorMessage(err, 'Failed to save food item')
      );
    } finally {
      mutationInProgress.current = false;
      setSaving(false);
    }
  };

  const handleAvailabilityChange = async (item: IFoodItem) => {
    if (mutationInProgress.current) {
      return;
    }

    const action = item.isAvailable ? 'Hide' : 'Restore';

    if (
      !window.confirm(
        `${action} "${item.name}" ${
          item.isAvailable ? 'from' : 'on'
        } the customer menu?`
      )
    ) {
      return;
    }

    mutationInProgress.current = true;
    setBusyItemId(item._id);
    setError(null);
    setSuccess(null);

    try {
      const response = item.isAvailable
        ? await hideFoodItem(item._id)
        : await restoreFoodItem(item._id);

      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem._id === item._id
            ? response.data
            : currentItem
        )
      );

      setSuccess(
        item.isAvailable
          ? 'Food item hidden from customers.'
          : 'Food item restored to the customer menu.'
      );
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          'Failed to change food availability'
        )
      );
    } finally {
      mutationInProgress.current = false;
      setBusyItemId(null);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      `${item.name} ${item.description} ${item.category}`
        .toLowerCase()
        .includes(normalizedSearch);

    const matchesAvailability =
      availability === 'all' ||
      (availability === 'available' && item.isAvailable) ||
      (availability === 'hidden' && !item.isAvailable);

    return matchesSearch && matchesAvailability;
  });

  const mutationBusy = saving || busyItemId !== null;

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Food Menu
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Add food, edit menu details, and manage availability.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateEditor}
            disabled={loading || mutationBusy}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add food item
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        {/* Create and edit form */}
        {editorOpen && (
          <section
            ref={editorRef}
            className="scroll-mt-20 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
          >
            <h2 className="mb-5 text-lg font-semibold text-gray-900">
              {editingItem ? 'Edit food item' : 'Add food item'}
            </h2>

            <form onSubmit={handleSubmit}>
              <fieldset disabled={saving} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">
                      Name
                    </span>

                    <input
                      required
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">
                      Category
                    </span>

                    <input
                      required
                      value={form.category}
                      placeholder="Pizza, Beverages, Desserts..."
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">
                      Price (USD)
                    </span>

                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          price: event.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-gray-700">
                      Image
                      {editingItem ? ' (optional replacement)' : ''}
                    </span>

                    <input
                      ref={imageInputRef}
                      required={!editingItem}
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setImage(
                          event.target.files?.[0] || null
                        )
                      }
                      className={`${inputClass} file:mr-3 file:rounded file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-indigo-700`}
                    />

                    {editingItem && (
                      <p className="mt-1 text-xs text-gray-500">
                        Leave empty to keep the current image.
                      </p>
                    )}
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </span>

                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </label>

                {editingItem && (
                  <img
                    src={getFoodImageUrl(editingItem.image)}
                    alt={`Current image of ${editingItem.name}`}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                )}

                {formError && (
                  <p
                    role="alert"
                    className="text-sm text-red-600"
                  >
                    {formError}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {saving
                      ? 'Saving…'
                      : editingItem
                        ? 'Save changes'
                        : 'Create food'}
                  </button>

                  <button
                    type="button"
                    onClick={resetEditor}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </fieldset>
            </form>
          </section>
        )}

        {/* Local search and availability filters */}
        <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Search food
              </span>

              <input
                type="search"
                value={search}
                placeholder="Search name, category, or description"
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Availability
              </span>

              <select
                value={availability}
                onChange={(event) =>
                  setAvailability(
                    event.target.value as
                      | 'all'
                      | 'available'
                      | 'hidden'
                  )
                }
                className={inputClass}
              >
                <option value="all">All food items</option>
                <option value="available">Available</option>
                <option value="hidden">Hidden</option>
              </select>
            </label>
          </div>
        </section>

        {/* Food list */}
        <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Menu items
            </h2>

            <span className="text-sm text-gray-500">
              {filteredItems.length} items
            </span>
          </div>

          {loading ? (
            <p
              role="status"
              className="p-8 text-center text-sm text-gray-500"
            >
              Loading food items…
            </p>
          ) : filteredItems.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-500">
              {error
                ? 'Food items could not be loaded.'
                : 'No food items match your filters.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      'Food',
                      'Category',
                      'Price',
                      'Availability',
                      'Actions',
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <tr
                      key={item._id}
                      className="align-top hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-64 gap-3">
                          <img
                            src={getFoodImageUrl(item.image)}
                            alt={item.name}
                            loading="lazy"
                            className="h-16 w-16 shrink-0 rounded-lg bg-gray-100 object-cover"
                          />

                          <div>
                            <p className="font-medium text-gray-900">
                              {item.name}
                            </p>

                            <p className="mt-1 max-w-sm text-sm text-gray-500">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {item.category}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900">
                        {currencyFormatter.format(item.price)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.isAvailable
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {item.isAvailable
                            ? 'Available'
                            : 'Hidden'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditEditor(item)}
                            disabled={mutationBusy}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              void handleAvailabilityChange(item);
                            }}
                            disabled={mutationBusy || editorOpen}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-60 ${
                              item.isAvailable
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {busyItemId === item._id
                              ? 'Updating…'
                              : item.isAvailable
                                ? 'Hide'
                                : 'Restore'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}