import ClientDetailPage from '@/component/ClientDetailPage';

export default async function MedicineDetailPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params; // 這裡 await params

 return (
    <ClientDetailPage id={id} />
  );
}