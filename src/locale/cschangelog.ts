export const csChangelog: {
  [key: string]: { [key: string]: { [key: string]: string[] } };
} = {
  "2022": {
    "2": {
      "16": [
        "Změna ovládání:",
        "Kliknutím a tažením levého tlačítka myši se plátno posouvá,",
        "Prostřední tlačítko myši (kliknutí kolečkem) neprovádí žádnou akci",
      ],
    },
  },
  "2021": {
    "12": {
      "10": [
        "Přidáno nastavení pro změnu jazyka uživatelského rozhraní",
        'Přístupné přes menu "Vzhled" na hlavním panelu',
        'Přesunuto nastavení pro změnu jazyka slovníků z levého horního rohu do menu "Vzhled"',
      ],
    },
    "10": {
      "14": [
        "Přidána funkce ukládání obrázků diagramů do PNG",
        'Přístupné přes tlačítko "Vytvořit obrázek" na hlavním panelu',
      ],
    },
    "7": {
      "28": [
        "Rozšíření funkcionality kompaktního pohledu o vytváření vztahů a management vlastností",
        "Při vytváření vztahů v kompaktním pohledu přibyla možnost vytvoření nového vztahu",
        "V popisu pojmu kompaktního módu přibyla sekce s vlastnostmi, které se dají k pojmu přidávat či odebírat",
      ],
    },
    "6": {
      "9": [
        "Úplný/kompaktní pohled se nyní udržuje pro každý diagram, tj. pokud nastavíte pohled diagramu na kompakní, tak bude kompaktní i poté, co se k němu vrátíte",
      ],
    },
    "5": {
      "12": [
        'Implementována SSP cache pro kartu "Vztahy" v panelu detailu pojmu',
        "Pod obvyklým seznamem vztahů v pracovním prostoru si můžete nyní prohlédnout i vztahy mimo pracovní prostor.",
        'Pro jejich zobrazení klikněte na "Pojmy mimo pracovní prostor" na kartě "Vztahy" v detailu pojmu.',
        "Všechny akce pro vztahy (přetáhnutí na plátno, multiselekce...) fungují i pro tyto vztahy",
      ],
    },
    "4": {
      "30": [
        "Implementována SSP cache",
        "Vyhledávání pojmů nyní vyhledává i v SSP cache. Výsledky tohoto vyhledávání jsou zobrazeny pod seznamem slovníků",
        "Tlačítko 📚 seskupí výsledky podle slovníků",
        "Výběr vedle filtruje výsledky na slovník/y. Pokud je vybrán slovník a vyhledávací pole je prázdné, zobrazí se všechny pojmy daného slovníku",
        "Najetí myší na pojem ukáže podrobnější informace o daném pojmu",
        "Symbol ⭐ určuje, že daný pojem už je přítomen v pracovním prostoru",
        "Pro přidání pojmu jej přetáhněte na plátno jako jakýkoliv jiný pojem",
        "Můžete také použít ctrl + kliknutí na pojmy pro vybrání více pojmů najednou a ctrl + kliknutí na slovník pro vybrání všech pojmů ze skupiny",
        "Přidané pojmy jsou pouze pro čtení",
        "Pojmy jsou přidané do slovníku pouze pro čtení. Pokud není slovník zastoupen všemi jeho pojmy v pracovním prostoru, objeví se u slovníku počet pojmů. Kliknutím na tento počet se zobrazí všechny pojmy slovníku",
      ],
    },
    "3": {
      "19": [
        "Změněn vzhled výpisu vztahů v panelu detailu pojmu:",
        "Zde vypsané vztahy mohou být vybrány levým tlačítkem",
        "Pojem/pojmy mohou být přetáhnuty na plátno stejným způsobem, jako z levého panelu",
        "Přidána řada tlačítek k výpisu:",
        "Tlačítko ➕ přidá vybrané pojmy na plátno kolem vybraného pojmu jako předtím",
        "Tlačítko 🔍 umožňuje filtrovat vztahy podle typu, jména pojmu, stereotypů, slovníku atd.",
      ],
    },
    "2": {
      "7": [
        "Přidána čeština",
        "Přidáno tlačítko pro ohlašování chyb/navrhování úprav",
        'Nápověda změněna na "tahák"',
      ],
      "24": [
        "Změněno chování vybírání více pojmů: výběr v levém panelu se projevuje i na plátně a naopak",
        "Změny v ovládání popsány v Nápovědě",
      ],
    },
  },
};
