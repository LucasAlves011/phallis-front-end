import { redirect } from 'next/navigation';

export default function MainPage() {
   // Você pode mudar isso para '/produtos-m2' se preferir
   redirect('/catalogo');
}