import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, DocumentData, QueryDocumentSnapshot, Timestamp, orderBy, query } from 'firebase/firestore';
import type { Order } from '@/lib/data';

const orderCollection = collection(db, 'orders');

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Order => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        ...data,
        eventDate: data.eventDate,
        lastUpdated: data.lastUpdated,
        createdAt: data.createdAt,
    } as Order;
}

export const getOrders = async (): Promise<Order[]> => {
    const q = query(orderCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(fromFirestore);
};

export const addOrder = async (orderData: Omit<Order, 'id'>): Promise<Order> => {
    const docRef = await addDoc(orderCollection, orderData);
    return { id: docRef.id, ...orderData };
};

export const updateOrder = async (id: string, orderData: Partial<Order>): Promise<void> => {
    const orderDoc = doc(db, 'orders', id);
    await updateDoc(orderDoc, orderData);
};
