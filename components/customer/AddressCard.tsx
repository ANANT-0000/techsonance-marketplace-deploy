import { Briefcase, Home, MapPin, Pen, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ADDRESS_CARD_TEXT } from "@/constants/customerText";

export const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: any) => {
  const isWork = address.address_for?.toLowerCase() === "work";
  const isHome = address.address_for?.toLowerCase() === "home";
  const Icon = isWork ? Briefcase : isHome ? Home : MapPin;

  // Capitalize the title nicely
  const title = address.address_for
    ? address.address_for.charAt(0).toUpperCase() + address.address_for.slice(1)
    : ADDRESS_CARD_TEXT.DEFAULT_TITLE;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="h-full"
    >
      <Card
        className={`h-full  flex flex-col rounded-2xl border   transition-colors border-border ${address.is_default ? "border-theme-primary/10 bg-theme-primary/2 shadow-md" : "hover:border-border/80 shadow-md"}`}
      >
        <CardContent className="p-6 flex flex-col flex-1 w-full">
          {/* Header: Icon, Title, and Default Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary">
              <Icon size={20} strokeWidth={2.5} color="black" />
              <h3 className="font-bold text-theme-h6 text-foreground tracking-tight">
                {title.trim()}
              </h3>
            </div>
            {address.is_default && (
              <Badge
                variant="default"
                className="bg-theme-primary hover:bg-theme-primary/70 text-theme-primary-foreground rounded-full px-3 text-theme-tiny font-bold tracking-wide uppercase shadow-sm"
              >
                {ADDRESS_CARD_TEXT.BADGE_DEFAULT}
              </Badge>
            )}
          </div>

          {/* Address Body */}
          <div className="flex-1 flex flex-col gap-1 text-theme-body-sm text-muted-foreground leading-relaxed">
            <p className="font-bold text-foreground mb-0.5 text-theme-body">
              {address.name}
            </p>
            <p>{address.address_line1}</p>
            {address.street && <p>{address.street}</p>}
            <p>
              {address.city}, {address.state} {address.postal_code}
            </p>
            <p>{address.country}</p>

            {address.landmark && (
              <p className="mt-1 italic text-theme-caption">
                <span className="font-medium not-italic">
                  {ADDRESS_CARD_TEXT.LANDMARK}
                </span>{" "}
                {address.landmark}
              </p>
            )}

            <p className="mt-3 text-foreground font-medium">
              {address.phone || address.number}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-3 w-full">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onEdit(address.id)}
                className="flex items-center gap-1.5 text-theme-body-sm font-medium text-theme-secondary hover:text-theme-secondary/80 transition-colors"
              >
                <Pen size={14} /> {ADDRESS_CARD_TEXT.BTN_EDIT}
              </button>
              <button
                onClick={() => onDelete(address.user_id, address.id)}
                className="flex items-center gap-1.5 text-theme-body-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
              >
                <Trash2 size={14} /> {ADDRESS_CARD_TEXT.BTN_DELETE}
              </button>
            </div>

            {!address.is_default && (
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-full text-theme-body-sm font-semibold text-theme-secondary border-theme-primary/20 hover:bg-theme-primary/5 hover:text-theme-primary transition-colors mt-1"
                onClick={() => onSetDefault(address.user_id, address.id)}
              >
                {ADDRESS_CARD_TEXT.BTN_SET_DEFAULT}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
