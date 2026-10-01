import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { productAPI, categoryAPI } from '../api';
import { ProductCard, SkeletonCard, Pagination, EmptyState } from '../components/ui';
import { FiShoppingBag } from 'react-icons/fi';

const SORTS = [
  { value:'newest',    label:'Newest First' },
  { value:'price-asc', label:'Price: Low to High' },
  { value:'price-desc',label:'Price: High to Low' },
  { value:'rating-desc',label:'Top Rated' },
  { value:'bestseller',label:'Best Seller' },
];

function FilterSidebar({ categories, filters, onChange, onReset, mobile, onClose }) {
  return (
    <div className={`${mobile?'':'card'} p-5 space-y-6`}>
      {mobile && (
        <div className="flex items-center justify-between pb-3 border-b">
          <h3 className="font-display font-bold text-lg">Filters</h3>
          <button onClick={onClose}><FiX size={18}/></button>
        </div>
      )}
      {/* Category */}
      <div>
        <h4 className="font-semibold text-sm text-gray-700 mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map(cat=>(
            <label key={cat._id} className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="cat" checked={filters.category===cat._id} onChange={()=>onChange({category:cat._id, subcategory:''})} className="accent-primary"/>
              <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">{cat.icon} {cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h4 className="font-semibold text-sm text-gray-700 mb-3">Price Range (৳)</h4>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.minPrice} onChange={e=>onChange({minPrice:e.target.value})} className="input-field text-sm py-2"/>
          <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e=>onChange({maxPrice:e.target.value})} className="input-field text-sm py-2"/>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="font-semibold text-sm text-gray-700 mb-3">Min Rating</h4>
        <div className="space-y-1.5">
          {[4,3,2,1].map(r=>(
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="rating" checked={filters.rating===String(r)} onChange={()=>onChange({rating:String(r)})} className="accent-primary"/>
              <span className="text-sm flex items-center gap-1">{'⭐'.repeat(r)} <span className="text-gray-500">& up</span></span>
            </label>
          ))}
        </div>
      </div>

      {/* In stock */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={!!filters.inStock} onChange={e=>onChange({inStock:e.target.checked?'true':''})} className="accent-primary"/>
        <span className="text-sm font-medium text-gray-700">In Stock Only</span>
      </label>

      <button onClick={onReset} className="btn-outline w-full text-sm py-2">Reset Filters</button>
    </div>
  );
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    keyword:    searchParams.get('keyword')    || '',
    category:   searchParams.get('category')   || '',
    subcategory:searchParams.get('subcategory')|| '',
    brand:      '',
    minPrice:   '',
    maxPrice:   '',
    rating:     '',
    inStock:    '',
    featured:   searchParams.get('featured')   || '',
    flashSale:  searchParams.get('flashSale')  || '',
    newArrival: searchParams.get('newArrival') || '',
    sort:       'newest',
    page:       1,
  });

  useEffect(()=>{ categoryAPI.getAll().then(r=>setCategories(r.data)).catch(()=>{}); },[]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([,v])=>v!==''&&v!==false));
      const { data } = await productAPI.getAll(clean);
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(()=>{ fetchProducts(); }, [fetchProducts]);

  // Sync URL params into filters
  useEffect(()=>{
    const kw = searchParams.get('keyword');
    const cat= searchParams.get('category');
    if(kw!==null||cat!==null) setFilters(f=>({...f, keyword:kw||'', category:cat||'', page:1}));
  },[searchParams]);

  const updateFilter = (updates) => setFilters(f=>({...f,...updates, page:1}));
  const resetFilters = () => setFilters(f=>({...f, keyword:'', category:'', subcategory:'', brand:'', minPrice:'', maxPrice:'', rating:'', inStock:'', featured:'', flashSale:'', newArrival:'', page:1}));

  const title = (() => {
    if(filters.keyword)    return `Results for "${filters.keyword}"`;
    if(filters.flashSale)  return '🔥 Flash Sale';
    if(filters.newArrival) return '✨ New Arrivals';
    if(filters.featured)   return '⭐ Featured Products';
    const cat = categories.find(c=>c._id===filters.category);
    return cat ? cat.name : 'All Products';
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title">{title}</h1>
          {!loading && <p className="text-sm text-gray-500 mt-1">{total.toLocaleString()} products found</p>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={()=>setFilterOpen(true)} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-colors lg:hidden">
            <FiFilter size={15}/> Filter
          </button>
          <div className="relative">
            <select value={filters.sort} onChange={e=>updateFilter({sort:e.target.value})} className="appearance-none pl-4 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-primary cursor-pointer">
              {SORTS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14}/>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="w-56 flex-shrink-0 hidden lg:block">
          <FilterSidebar categories={categories} filters={filters} onChange={updateFilter} onReset={resetFilters}/>
        </aside>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {filterOpen && (
            <>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setFilterOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden"/>
              <motion.div initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}} transition={{type:'tween',duration:0.28}} className="fixed left-0 top-0 h-full w-72 bg-white z-50 overflow-y-auto p-5 lg:hidden">
                <FilterSidebar categories={categories} filters={filters} onChange={updateFilter} onReset={resetFilters} mobile onClose={()=>setFilterOpen(false)}/>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(12)].map((_,i)=><SkeletonCard key={i}/>)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState icon={FiShoppingBag} title="No products found" desc="Try adjusting your filters or search terms" action={resetFilters} actionLabel="Clear Filters"/>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p,i)=><ProductCard key={p._id} product={p} index={i}/>)}
              </div>
              <Pagination page={filters.page} pages={totalPages} onChange={p=>setFilters(f=>({...f,page:p}))}/>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
