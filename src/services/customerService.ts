import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, DocumentData, QueryDocumentSnapshot, getDoc } from 'firebase/firestore';
import type { Customer } from '@/lib/data';

const customerCollection = collection(db, 'customers');

const fromFirestore = (snapshot: QueryDocumentSnapshot<DocumentData>): Customer => {
    const data = snapshot.data();
    return {
        id: snapshot.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        totalOrders: data.totalOrders
    };
}

export const getCustomers = async (): Promise<Customer[]> => {
    const snapshot = await getDocs(customerCollection);
    return snapshot.docs.map(fromFirestore);
};

export const addCustomer = async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
    const docRef = await addDoc(customerCollection, customerData);
    const newDoc = await getDoc(docRef);
    return fromFirestore(newDoc as QueryDocumentSnapshot<DocumentData>);
};

export const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<void> => {
    const customerDoc = doc(db, 'customers', id);
    await updateDoc(customerDoc, customerData);
};
