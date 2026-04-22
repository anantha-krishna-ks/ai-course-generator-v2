import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GlossaryEntry {
  term: string;
  description: string;
}

const GLOSSARY: GlossaryEntry[] = [
  { term: "Carbon accounting", description: "The systematic measurement and reporting of an organisation's greenhouse gas emissions and removals, usually expressed in CO₂e, to support management and external disclosure." },
  { term: "CO₂e", description: "Carbon dioxide equivalent, a standard unit that converts different greenhouse gases into the amount of CO₂ that would have the same global warming impact." },
  { term: "Emission factor", description: "A coefficient that links an activity measure, such as litres of fuel or kWh of electricity, to the associated quantity of greenhouse gas emissions." },
  { term: "Emission intensity", description: "A ratio that expresses greenhouse gas emissions per unit of activity, such as per unit of product, per $1 million of revenue, or per employee." },
  { term: "Emissions intensity ratio", description: "A performance metric that expresses greenhouse gas emissions relative to a business driver, such as revenue, production volume or service hours." },
  { term: "Greenhouse gas emissions", description: "Releases of gases such as carbon dioxide, methane and nitrous oxide that trap heat in the atmosphere and are quantified for climate reporting and regulation." },
  { term: "Greenhouse Gas Protocol", description: "A widely used international framework that sets rules for how organisations classify, measure, and report greenhouse gas emissions across their operations and value chains." },
  { term: "IFRS", description: "International Financial Reporting Standards, which provide globally recognised rules for preparing financial statements and are increasingly applied with climate considerations in mind." },
  { term: "IFRS S2", description: "An ISSB standard setting out requirements for the disclosure of climate-related risks and opportunities, including greenhouse gas emissions metrics and targets." },
  { term: "Impairment test", description: "An assessment under accounting standards to determine whether the recoverable amount of an asset has fallen below its carrying amount, potentially requiring a write‑down." },
  { term: "International Sustainability Standards Board (ISSB)", description: "The standard-setting body under the IFRS Foundation responsible for developing global sustainability-related disclosure standards, including climate-focused IFRS S2." },
  { term: "ISO 14064", description: "An international standard series that specifies principles and requirements for quantifying, monitoring, and verifying greenhouse gas emissions and removals." },
  { term: "Net zero target", description: "A commitment by an organisation to balance its emissions with removals so that, over a defined period, its overall contribution to atmospheric greenhouse gases is zero." },
  { term: "Scope 3 emissions", description: "Indirect greenhouse gas emissions that occur in an organisation's value chain outside its direct control, such as from suppliers, customers and business travel." },
  { term: "Streamlined Energy and Carbon Reporting (SECR)", description: "A UK reporting framework that requires qualifying entities to disclose energy use and associated greenhouse gas emissions in their annual reports." },
  { term: "Task Force on Climate-related Financial Disclosures (TCFD)", description: "An initiative that developed widely used recommendations for consistent climate-related financial risk disclosures across governance, strategy, risk management and metrics." },
  { term: "Task Force on Climate‑related Financial Disclosures (TCFD)", description: "A framework for reporting climate‑related risks and opportunities, covering governance, strategy, risk management, and metrics and targets." },
];

export const GlossaryDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Open glossary"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Info className="w-4 h-4" aria-hidden="true" focusable="false" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-[97vw] max-w-6xl h-[92vh] max-h-[92vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-8 pt-7 pb-5 border-b">
          <DialogTitle className="text-2xl font-semibold text-foreground">Glossary</DialogTitle>
          <DialogDescription className="text-base text-foreground/80">
            Key terms and definitions referenced throughout this course.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 thin-scrollbar">
          <div className="px-8 py-5">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[35%] text-foreground font-semibold text-base">Glossary Term</TableHead>
                  <TableHead className="text-foreground font-semibold text-base">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {GLOSSARY.map((entry) => (
                  <TableRow key={entry.term} className="align-top">
                    <TableCell className="font-semibold text-foreground py-4 text-[15px]" style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
                      {entry.term}
                    </TableCell>
                    <TableCell className="text-foreground/85 py-4 leading-relaxed text-[15px]" style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
                      {entry.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
