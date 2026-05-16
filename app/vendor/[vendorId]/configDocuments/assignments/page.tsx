'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { authToken } from '@/utils/authToken';
import { ShieldCheck, Plus, Trash2, Loader2, Tag, Box } from 'lucide-react';
import { assignPolicyToCategory, assignProductPolicyOverride, fetchCategoryPolicies, fetchProductPolicies, fetchProductPolicyOverrides, fetchVendorProducts, fetchVendorsProductsCategory, removePolicyFromCategory, removeProductPolicyOverride } from '@/utils/vendorApiClient';

export default function PolicyAssignmentsPage() {
  const params = useParams();
  const vendorId = params.vendorId as string;
  const token = authToken();

  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('categories');
  const [loading, setLoading] = useState(true);

  // Global Data
  const [policies, setPolicies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Category State
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categoryAssignments, setCategoryAssignments] = useState<any[]>([]);
  const [selectedPolicyForCategory, setSelectedPolicyForCategory] = useState('');
  const [isAssigningCat, setIsAssigningCat] = useState(false);

  // Product State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productOverrides, setProductOverrides] = useState<any[]>([]);
  const [selectedPolicyForProduct, setSelectedPolicyForProduct] = useState('');
  const [isAssigningProd, setIsAssigningProd] = useState(false);

  // 1. Fetch Initial Global Data
  useEffect(() => {
    if (!token) return;
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [policyRes, catRes, prodRes] = await Promise.all([
          fetchProductPolicies(token),
          fetchVendorsProductsCategory(token),  
          fetchVendorProducts( token), 
        ]);
        
        setPolicies(policyRes?.data || policyRes || []);
        setCategories(catRes?.data || catRes || []);
        setProducts(prodRes?.data || prodRes || []);
      } catch (error) {
        console.error("Failed to load initial data", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [token, vendorId]);

  // 2. Fetch Category Assignments when Category changes
  useEffect(() => {
    if (!selectedCategoryId || !token) return;
    const loadCatPolicies = async () => {
      const res = await fetchCategoryPolicies(selectedCategoryId, token);
      setCategoryAssignments(res?.data || res || []);
    };
    loadCatPolicies();
  }, [selectedCategoryId, token]);

  // 3. Fetch Product Overrides when Product changes
  useEffect(() => {
    if (!selectedProductId || !token) return;
    const loadProdPolicies = async () => {
      const res = await fetchProductPolicyOverrides(selectedProductId, token);
      setProductOverrides(res?.data || res || []);
    };
    loadProdPolicies();
  }, [selectedProductId, token]);

  // --- Handlers ---
  const handleAssignCategoryPolicy = async () => {
    if (!selectedCategoryId || !selectedPolicyForCategory) return;
    setIsAssigningCat(true);
    await assignPolicyToCategory({ category_id: selectedCategoryId, policy_id: selectedPolicyForCategory }, token!);
    
    // Refresh assignments
    const res = await fetchCategoryPolicies(selectedCategoryId, token!);
    setCategoryAssignments(res?.data || res || []);
    setSelectedPolicyForCategory('');
    setIsAssigningCat(false);
  };

  const handleRemoveCategoryPolicy = async (assignmentId: string) => {
    await removePolicyFromCategory(assignmentId, token!);
    setCategoryAssignments(prev => prev.filter(a => a.id !== assignmentId));
  };

  const handleAssignProductPolicy = async () => {
    if (!selectedProductId || !selectedPolicyForProduct) return;
    setIsAssigningProd(true);
    await fetchCreateAssignedProductPolicyOverride({ product_id: selectedProductId, policy_id: selectedPolicyForProduct }, token!);
    
    // Refresh overrides
    const res = await fetchProductPolicyOverrides(selectedProductId, token!);
    setProductOverrides(res?.data || res || []);
    setSelectedPolicyForProduct('');
    setIsAssigningProd(false);
  };

  const handleRemoveProductPolicy = async (overrideId: string) => {
    await removeProductPolicyOverride(overrideId, token!);
    setProductOverrides(prev => prev.filter(o => o.id !== overrideId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="w-full max-w-5xl mx-auto py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldCheck className="text-blue-600 w-7 h-7" />
          Policy Assignments
        </h1>
        <p className="text-gray-500 mt-1">
          Map your configured warranty and return policies to specific categories or override them on individual products.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 px-4 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'categories' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Tag className="w-4 h-4" /> Category Policies
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 font-medium text-sm flex items-center gap-2 ${
            activeTab === 'products' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Box className="w-4 h-4" /> Product Overrides
        </button>
      </div>

      {/* --- CATEGORY TAB --- */}
      {activeTab === 'categories' && (
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select a Category</label>
            <select
              className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              <option value="">-- Choose Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {selectedCategoryId && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Assigned Policies</h3>
              
              {/* Assignment List */}
              {categoryAssignments.length === 0 ? (
                <p className="text-sm text-gray-500 italic mb-4">No policies assigned to this category yet.</p>
              ) : (
                <ul className="space-y-3 mb-6">
                  {categoryAssignments.map((assignment) => {
                    const policyDetails = policies.find(p => p.id === assignment.policy_id);
                    return (
                      <li key={assignment.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                          <p className="font-semibold text-gray-800">{policyDetails?.policy_name || 'Unknown Policy'}</p>
                          <p className="text-xs text-gray-500 capitalize">{policyDetails?.policy_type?.replace('_', ' ')}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveCategoryPolicy(assignment.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Assign New Policy Form */}
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign New Policy</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none"
                    value={selectedPolicyForCategory}
                    onChange={(e) => setSelectedPolicyForCategory(e.target.value)}
                  >
                    <option value="">-- Select a Policy --</option>
                    {policies.map((p) => (
                      <option key={p.id} value={p.id}>{p.policy_name} ({p.policy_type})</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAssignCategoryPolicy}
                  disabled={!selectedPolicyForCategory || isAssigningCat}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isAssigningCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Assign Policy
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* --- PRODUCT TAB --- */}
      {activeTab === 'products' && (
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select a Product</label>
            <select
              className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">-- Choose Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name || p.title}</option>
              ))}
            </select>
          </div>

          {selectedProductId && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Policy Overrides</h3>
              
              {productOverrides.length === 0 ? (
                <p className="text-sm text-gray-500 italic mb-4">This product uses standard category policies. No overrides applied.</p>
              ) : (
                <ul className="space-y-3 mb-6">
                  {productOverrides.map((override) => {
                    const policyDetails = policies.find(p => p.id === override.policy_id);
                    return (
                      <li key={override.id} className="flex justify-between items-center bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                        <div>
                          <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded mb-1 inline-block">OVERRIDE</span>
                          <p className="font-semibold text-gray-800">{policyDetails?.policy_name || 'Unknown Policy'}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveProductPolicy(override.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="bg-orange-50/30 p-5 rounded-xl border border-orange-100 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apply New Override</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none"
                    value={selectedPolicyForProduct}
                    onChange={(e) => setSelectedPolicyForProduct(e.target.value)}
                  >
                    <option value="">-- Select a Policy --</option>
                    {policies.map((p) => (
                      <option key={p.id} value={p.id}>{p.policy_name} ({p.policy_type})</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAssignProductPolicy}
                  disabled={!selectedPolicyForProduct || isAssigningProd}
                  className="bg-orange-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {isAssigningProd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Apply Override
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}