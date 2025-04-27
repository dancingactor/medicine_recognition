import EventDetail from '@/component/EventDetailPage';

export default async function MedicineDetailPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params; // 這裡 await params

 return (
    <EventDetail id={id} />
  );
}