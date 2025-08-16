"use client"

import React, { useState } from "react"
import { MoreHorizontal, PlusCircle } from "lucide-react"

import type { MenuItem } from "@/lib/data"
import { menuItems as initialMenuItems } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null)
  const { toast } = useToast()

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newMenuItem: MenuItem = {
      id: currentItem?.id || `MENU${Date.now()}`,
      name: formData.get("name") as string,
      category: formData.get("category") as "Veg" | "Non-Veg",
      price: parseFloat(formData.get("price") as string),
    }

    if (currentItem) {
      setMenuItems(
        menuItems.map((item) =>
          item.id === currentItem.id ? newMenuItem : item
        )
      )
      toast({ title: "Success", description: "Menu item updated." })
    } else {
      setMenuItems([...menuItems, newMenuItem])
      toast({ title: "Success", description: "New menu item added." })
    }
    setDialogOpen(false)
    setCurrentItem(null)
  }

  const handleDelete = (id: string) => {
    setMenuItems(menuItems.filter((item) => item.id !== id))
    toast({
      variant: "destructive",
      title: "Deleted",
      description: "Menu item has been deleted.",
    })
  }

  const handleOpenDialog = (item: MenuItem | null = null) => {
    setCurrentItem(item)
    setDialogOpen(true)
  }

  return (
    <>
       <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">Menu Management</h1>
          <p className="text-muted-foreground text-sm">Add, edit, or delete your menu items.</p>
        </div>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {menuItems.map((item) => (
          <Card key={item.id} className="flex flex-col">
            <CardHeader className="relative p-0">
              <Image 
                src="https://placehold.co/600x400.png"
                alt={item.name}
                width={600}
                height={400}
                className="rounded-t-lg object-cover"
                data-ai-hint="food item"
              />
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleOpenDialog(item)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(item.id)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-6">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <Badge variant={item.category === "Veg" ? "secondary" : "default"} className="mt-2">
                {item.category}
              </Badge>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <p className="text-lg font-semibold">${item.price.toFixed(2)}</p>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setCurrentItem(null)
          }
          setDialogOpen(isOpen)
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
            <DialogDescription>
              {currentItem ? "Make changes to your menu item here." : "Add a new item to your menu."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" defaultValue={currentItem?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Select name="category" defaultValue={currentItem?.category || 'Veg'}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Veg">Veg</SelectItem>
                    <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price</Label>
                <Input id="price" name="price" type="number" step="0.01" defaultValue={currentItem?.price} className="col-span-3" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setDialogOpen(false)
                setCurrentItem(null)
              }}>Cancel</Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
