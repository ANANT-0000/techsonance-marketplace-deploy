import { Briefcase, Home, MapPin, Pen, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export const AddressCard = ({ address, onEdit, onDelete, onSetDefault }: any) => {
    const isWork = address.address_for?.toLowerCase() === 'work';
    const isHome = address.address_for?.toLowerCase() === 'home';
    const Icon = isWork ? Briefcase : isHome ? Home : MapPin;
    
    // Capitalize the title nicely
    const title = address.address_for ? address.address_for.charAt(0).toUpperCase() + address.address_for.slice(1) : "Address";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full"
        >
            <Card className={`h-full flex flex-col rounded-2xl shadow-sm transition-colors border ${address.is_default ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-border/80'}`}>
                <CardContent className="p-6 flex flex-col flex-1">
                    
                    {/* Header: Icon, Title, and Default Badge */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Icon size={20} strokeWidth={2.5} />
                            <h3 className="font-bold text-lg text-foreground tracking-tight">
                                {title}
                            </h3>
                        </div>
                        {address.is_default && (
                            <Badge variant="default" className="bg-black hover:bg-black text-white rounded-full px-3 text-[10px] font-bold tracking-wide uppercase">
                                Default
                            </Badge>
                        )}
                    </div>

                    {/* Address Body */}
                    <div className="flex-1 flex flex-col gap-1 text-sm text-muted-foreground leading-relaxed">
                        <p className="font-bold text-foreground mb-0.5 text-base">{address.name}</p>
                        <p>{address.address_line1}</p>
                        {address.address_line2 && <p>{address.address_line2}</p>}
                        {address.street && <p>{address.street}</p>}
                        <p>{address.city}, {address.state} {address.postal_code}</p>
                        <p>{address.country}</p>
                        
                        {address.landmark && (
                            <p className="mt-1 italic text-xs">
                                <span className="font-medium not-italic">Landmark:</span> {address.landmark}
                            </p>
                        )}

                        <p className="mt-3 text-foreground font-medium">
                            {address.phone || address.number}
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onEdit(address.id)}
                                className="flex items-center gap-1.5 text-sm font-medium text-theme-primary hover:text-theme-secondary transition-colors"
                            >
                                <Pen size={14} /> Edit
                            </button>
                            <button
                                onClick={() => onDelete(address.user_id, address.id)}
                                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                        
                        {!address.is_default && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full h-8 px-4 text-xs font-semibold text-foreground border-border hover:bg-gray-50"
                                onClick={() => onSetDefault(address.user_id, address.id)}
                            >
                                Set as Default
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};