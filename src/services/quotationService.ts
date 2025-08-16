import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, DocumentData, QueryDocumentSnapshot, Timestamp, orderBy, query, writeBatch, getDoc, deleteField } from 'firebase/firestore';
import type { Quotation, Order } from '@/lib/data';

const quotationCollection = collection(db, 'quotations');
const orderCollection = collection(db, 'orders');


const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Quotation => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        ...data,
        eventDate: data.eventDate instanceof Timestamp ? data.eventDate.toDate().toISOString() : data.eventDate,
        lastUpdated: data.lastUpdated instanceof Timestamp ? data.lastUpdated.toDate().toISOString() : data.lastUpdated,
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
    const newDoc = await getDoc(docRef);
    return fromFirestore(newDoc as QueryDocumentSnapshot<DocumentData>);
};

export const updateQuotation = async (id: string, quotationData: Partial<Quotation>): Promise<void> => {
    const quotationDoc = doc(db, 'quotations', id);
    const dataToUpdate: { [key: string]: any } = { ...quotationData };

    if (dataToUpdate.eventDate && typeof dataToUpdate.eventDate === 'string') {
        dataToUpdate.eventDate = Timestamp.fromDate(new Date(dataToUpdate.eventDate));
    }
    if (dataToUpdate.lastUpdated && typeof dataToUpdate.lastUpdated === 'string') {
        dataToUpdate.lastUpdated = Timestamp.fromDate(new Date(dataToUpdate.lastUpdated));
    }

    // Firestore doesn't support `undefined` values. We need to remove them.
    Object.keys(dataToUpdate).forEach(key => {
        if (dataToUpdate[key] === undefined) {
            dataToUpdate[key] = deleteField();
        }
    });

    await updateDoc(quotationDoc, dataToUpdate);
};

export const addOrderFromQuotation = async (quotation: Quotation): Promise<string> => {
    const newOrderRef = doc(collection(db, "orders"));

    const newOrder: Omit<Order, 'id'> = {
      customerName: quotation.customerName,
      eventName: quotation.eventName,
      eventDate: Timestamp.fromDate(new Date(quotation.eventDate)),
      status: 'Confirmed',
      items: quotation.items,
      orderType: quotation.orderType,
      perPlatePrice: quotation.perPlatePrice,
      numberOfPlates: quotation.numberOfPlates,
      lastUpdated: Timestamp.now(),
      createdAt: Timestamp.now()
    };
    
    const quotationDocRef = doc(db, 'quotations', quotation.id);
    
    const batch = writeBatch(db);
    batch.set(newOrderRef, newOrder);
    batch.update(quotationDocRef, { status: 'Ordered' });

    await batch.commit();
    
    return newOrderRef.id;
  };
