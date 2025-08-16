import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, DocumentData, QueryDocumentSnapshot, Timestamp, orderBy, query, getDoc } from 'firebase/firestore';
import type { Order } from '@/lib/data';

const orderCollection = collection(db, 'orders');

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Order => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        ...data,
        eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate().toISOString() : data.eventDate,
        lastUpdated: data.lastUpdated instanceof Timestamp ? data.lastUpdated.toDate().toISOString() : data.lastUpdated,
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
    const newDoc = await getDoc(docRef);
    return fromFirestore(newDoc as QueryDocumentSnapshot<DocumentData>);
};

export const updateOrder = async (id: string, orderData: Partial<Order>): Promise<void> => {
    const orderDoc = doc(db, 'orders', id);
    const dataToUpdate = { ...orderData };
    if (dataToUpdate.eventDate && typeof dataToUpdate.eventDate === 'string') {
        dataToUpdate.eventDate = Timestamp.fromDate(new Date(dataToUpdate.eventDate));
    }
    if (dataToUpdate.lastUpdated && typeof dataToUpdate.lastUpdated === 'string') {
        dataToUpdate.lastUpdated = Timestamp.fromDate(new Date(dataToUpdate.lastUpdated));
    }
    await updateDoc(orderDoc, dataToUpdate);
};
