import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, DocumentData, QueryDocumentSnapshot, Timestamp, orderBy, query, writeBatch } from 'firebase/firestore';
import type { Quotation, Order } from '@/lib/data';

const quotationCollection = collection(db, 'quotations');
const orderCollection = collection(db, 'orders');


const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Quotation => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        ...data,
        eventDate: data.eventDate,
        lastUpdated: data.lastUpdated,
        createdAt: data.createdAt,
    } as Quotation;
}

export const getQuotations = async (): Promise<Quotation[]> => {
    const q = query(quotationCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(fromFirestore);
};

export const addQuotation = async (quotationData: Omit<Quotation, 'id'>): Promise<Quotation> => {
    const docRef = await addDoc(quotationCollection, quotationData);
    return { id: docRef.id, ...quotationData };
};

export const updateQuotation = async (id: string, quotationData: Partial<Quotation>): Promise<void> => {
    const quotationDoc = doc(db, 'quotations', id);
    await updateDoc(quotationDoc, quotationData);
};

export const addOrderFromQuotation = async (quotation: Quotation): Promise<string> => {
    const newOrderRef = doc(collection(db, "orders"));

    const newOrder: Omit<Order, 'id'> = {
      customerName: quotation.customerName,
      eventName: quotation.eventName,
      eventDate: quotation.eventDate,
      status: 'Confirmed',
      items: quotation.items,
      orderType: quotation.orderType,
      perPlatePrice: quotation.perPlatePrice,
      numberOfPlates: quotation.numberOfPlates,
      lastUpdated: new Date().toISOString(),
      createdAt: Timestamp.now()
    };
    
    const quotationDocRef = doc(db, 'quotations', quotation.id);
    
    const batch = writeBatch(db);
    batch.set(newOrderRef, newOrder);
    batch.update(quotationDocRef, { status: 'Ordered' });

    await batch.commit();
    
    return newOrderRef.id;
  };
