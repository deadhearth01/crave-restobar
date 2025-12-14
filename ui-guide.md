# **UI Implementation Guide: Building Beautiful Dashboards with Next.js 14 + HeroUI**

## **Core Principles**

### **1. Consistent Layout Architecture**
```tsx
// Standard page structure pattern
<div className="flex h-screen bg-[#f1ede5]">
  <Sidebar />
  <div className="flex-1 md:ml-64 md:[html[data-sidebar-collapsed='true']_&]:ml-20 flex flex-col overflow-hidden">
    <TopBar />
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      {/* Content here */}
    </main>
  </div>
</div>
```

**Key Points:**
- `flex h-screen` = Full viewport height layout
- `overflow-y-auto` on main = Scrollable content area only
- Responsive sidebar width compensation: `md:ml-64` for expanded, `md:ml-20` for collapsed
- Consistent padding: `p-4 md:p-8` (mobile: 16px, desktop: 32px)

---

## **2. Color System & Theme**

### **Brand Colors**
```css
:root {
  --primary: #6f0d07;     /* Deep red */
  --primary-hover: #5a0a05;
  --secondary: #a6a39d;   /* Warm gray */
}
```

### **Tailwind Custom Colors**
```typescript
// tailwind.config.ts
primary: {
  DEFAULT: '#6f0d07',
  50: '#fef2f2',
  900: '#6f0d07',
  950: '#450a04',
}
```

### **Background System**
- Main background: `bg-[#f1ede5]` (warm cream)
- Cards: `bg-white` with borders
- Overlays: `bg-gradient-to-br from-{color}-100 to-{color}-50`

---

## **3. Card Design Pattern**

### **Basic Card Structure**
```tsx
<Card className="
  bg-white
  border-2 border-gray-200
  rounded-2xl
  shadow-sm
  hover:shadow-md
  hover:-translate-y-1
  transition-all duration-200
">
  <CardBody className="p-6">
    {/* Content */}
  </CardBody>
</Card>
```

### **Status-Based Card Colors**
```tsx
// Dynamic styling based on state
className={`
  rounded-2xl shadow-sm border transition-all duration-200
  ${isLowStock ? "border-red-300 bg-red-50" :
    isOverStock ? "border-amber-300 bg-amber-50" :
    "border-gray-200 bg-[#DBFCE7]"}
  hover:shadow-md hover:-translate-y-1
`}
```

---

## **4. Typography Hierarchy**

```tsx
// Page Title
<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
  <Icon className="text-[#6f0d07]" size={36} />
  Page Title
</h1>

// Section Title
<h2 className="text-xl font-semibold text-gray-900">

// Card Title
<h3 className="text-lg font-semibold text-gray-900 capitalize">

// Subtitle/Description
<p className="text-gray-600 mt-2">
```

---

## **5. Button System**

### **Primary Actions**
```tsx
<Button
  onPress={handleAction}
  className="
    bg-[#6f0d07]
    text-white
    font-semibold
    rounded-xl
    shadow-lg
    hover:bg-[#8b1108]
  "
  startContent={<Icon size={20} />}
>
  Action
</Button>
```

### **Icon Buttons**
```tsx
<Button
  size="sm"
  isIconOnly
  className="
    bg-blue-100
    text-blue-700
    hover:bg-blue-200
    rounded-lg
  "
  onPress={handleEdit}
>
  <Edit size={16} />
</Button>
```

### **Button Variants**
- **Primary**: `bg-[#6f0d07] text-white`
- **Edit**: `bg-blue-100 text-blue-700`
- **Delete**: `bg-red-100 text-red-700`
- **Success**: `bg-green-100 text-green-700`
- **Warning**: `bg-amber-100 text-amber-700`

---

## **6. Chip/Badge System**

### **Status Chips**
```tsx
<Chip className="
  bg-{color}-100
  text-{color}-700
  font-medium
  rounded-full
  px-3 py-1
  flex items-center gap-1.5
  border border-{color}-200
">
  <AlertTriangle size={14} className="text-{color}-600" />
  <span>Status</span>
</Chip>
```

### **Role Badges**
```tsx
<Chip className="
  bg-[#a6a39d]/20
  text-gray-800
  py-4 px-2
  font-semibold
  rounded-xl
">
  Branch Name
</Chip>
```

---

## **7. Modal Design**

### **Standard Modal Structure**
```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  size="2xl"
  scrollBehavior="inside"
>
  <ModalContent>
    <ModalHeader className="
      flex flex-col gap-1
      border-b border-gray-200
      pb-4
    ">
      <h2 className="text-2xl font-bold text-gray-900">
        Title
      </h2>
      <p className="text-sm text-gray-500">
        Description
      </p>
    </ModalHeader>

    <ModalBody className="py-6">
      {/* Form content */}
    </ModalBody>

    <ModalFooter className="
      border-t border-gray-200
      pt-4
    ">
      <Button variant="light" onPress={onClose}>
        Cancel
      </Button>
      <Button className="bg-[#6f0d07] text-white">
        Save
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

---

## **8. Loading States**

### **Full Page Loader**
```tsx
if (loading) {
  return (
    <div className="flex h-screen bg-[#f1ede5]">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" color="danger" />
            <p className="mt-4 text-gray-600 font-medium">Loading...</p>
          </div>
        </main>
      </div>
    </div>
  );
}
```

### **Inline Loader**
```tsx
{isLoading ? (
  <Spinner size="sm" color="danger" />
) : (
  <Content />
)}
```

---

## **9. Responsive Grid Layouts**

### **Card Grid**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id}>
      {/* Card content */}
    </Card>
  ))}
</div>
```

### **Stats Grid**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  {stats.map(stat => (
    <Card className="bg-gradient-to-br from-{color}-100 to-{color}-50">
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
          <Icon size={32} className="text-{color}-600" />
        </div>
      </CardBody>
    </Card>
  ))}
</div>
```

---

## **10. Icon Containers**

### **Gradient Icon Boxes**
```tsx
<div className={`
  p-3
  rounded-2xl
  bg-gradient-to-br ${channelInfo.color}
  shadow-md
`}>
  <Icon className="w-6 h-6 text-white" />
</div>
```

### **Flat Icon Boxes**
```tsx
<div className="
  p-4
  rounded-2xl
  bg-[#6f0d07]
  text-white
  shadow-lg
">
  <Icon size={32} strokeWidth={2.5} />
</div>
```

---

## **11. Animation & Transitions**

### **Hover Effects**
```tsx
className="
  transition-all duration-200
  hover:shadow-md
  hover:-translate-y-1
  hover:scale-105
"
```

### **GSAP Animations** (for advanced effects)
```tsx
useEffect(() => {
  if (hasAnimated.current) return;
  gsap.fromTo(
    elementRef.current?.children || [],
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power2.out',
    }
  );
  hasAnimated.current = true;
}, [data]);
```

---

## **12. Form Input Styling**

### **Standard Input**
```tsx
<Input
  label="Label"
  placeholder="Enter value..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
  variant="bordered"
  classNames={{
    inputWrapper: "border-gray-300 rounded-xl",
    input: "text-gray-900",
  }}
/>
```

### **Select Dropdown**
```tsx
<Select
  label="Category"
  selectedKeys={[category]}
  onSelectionChange={(keys) => setCategory(Array.from(keys)[0])}
  variant="bordered"
  classNames={{
    trigger: "border-gray-300 rounded-xl",
  }}
>
  {OPTIONS.map(opt => (
    <SelectItem key={opt.value} value={opt.value}>
      {opt.label}
    </SelectItem>
  ))}
</Select>
```

---

## **13. Empty States**

```tsx
{items.length === 0 ? (
  <Card className="col-span-full bg-white border border-gray-200 rounded-2xl shadow-sm">
    <CardBody className="text-center py-12">
      <Icon size={48} className="mx-auto text-gray-300 mb-4" />
      <p className="text-gray-500 font-medium">
        No items found
      </p>
      <p className="text-sm text-gray-400 mt-2">
        Get started by adding your first item
      </p>
      <Button
        className="mt-6 bg-[#6f0d07] text-white"
        startContent={<Plus size={20} />}
      >
        Add Item
      </Button>
    </CardBody>
  </Card>
) : (
  // Items grid
)}
```

---

## **14. Notification Badge**

```tsx
<button className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white shadow-sm">
  <Bell size={18} className="text-gray-700" />
  {unreadCount > 0 && (
    <span className="
      absolute -top-1 -right-1
      min-w-[18px] h-[18px] px-1
      flex items-center justify-center
      bg-red-500 text-white
      text-[10px] font-bold
      rounded-full
      border-2 border-white
      shadow-sm
    ">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  )}
</button>
```

---

## **15. Scrollable Areas**

### **ScrollShadow Component**
```tsx
<ScrollShadow className="max-h-[320px]">
  {items.map(item => (
    <div key={item.id} className="p-4 border-b">
      {/* Item content */}
    </div>
  ))}
</ScrollShadow>
```

---

## **Common Mistakes to Avoid**

### ❌ **Don't Do This:**
```tsx
// Uneven spacing
<div className="p-2"> // Too tight
<div className="p-12"> // Too loose

// Inconsistent borders
border-1  // Wrong
border    // Wrong

// Mixed color systems
bg-red-500 // Generic Tailwind
bg-[#6f0d07] // Custom brand color (inconsistent)
```

### ✅ **Do This:**
```tsx
// Consistent spacing scale
p-4 (mobile) → p-6 (tablet) → p-8 (desktop)

// Standard borders
border-2 border-gray-200

// Unified color system
bg-primary-900 OR bg-[#6f0d07] (pick one and stick with it)
```

---

## **Key Spacing Scale**

- **Gaps**: `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `gap-6` (24px)
- **Padding**: `p-4` (16px), `p-6` (24px), `p-8` (32px)
- **Margins**: `mb-4` (16px), `mb-6` (24px), `mb-8` (32px)
- **Rounded**: `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px)

---

## **Final Checklist**

✅ Consistent layout structure (Sidebar + TopBar + Main)  
✅ Proper responsive breakpoints (`md:`, `lg:`)  
✅ Brand colors from theme config  
✅ Shadow hierarchy (`shadow-sm` → `shadow-md` → `shadow-lg`)  
✅ Hover states with transitions  
✅ Loading states for all async operations  
✅ Empty states with helpful CTAs  
✅ Proper spacing using Tailwind scale  
✅ Rounded corners (`rounded-xl`, `rounded-2xl`)  
✅ Icon consistency (16px, 18px, 20px sizes)  
✅ Typography hierarchy maintained  
✅ Status colors (red=error, amber=warning, green=success)  

---

This pattern creates **visually consistent, professional, and responsive** dashboards. Apply these principles to fix uneven layouts, inconsistent spacing, and broken components.