import CategoryManager from './CategoryManager';

export const metadata = {
    title: 'Manage Categories - Together with Farm Admin',
    description: 'Create and manage app categories',
};

export default function ManageCategoriesPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Manage Categories</h1>
            <CategoryManager />
        </div>
    );
}
