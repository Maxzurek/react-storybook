import { Checkbox, Divider } from "@mui/material";
import { useRef } from "react";
import StorybookContextMenu from "./ContextMenu";
import StorybookMenu from "./Menu";
import StorybookMenuItem from "./MenuItem";
import { NestedMenuItem } from "./NestedMenuItem";

const menuItems = ["Item1", "Item2", "Item3", "Item4"];

export default function MuiMenu() {
    const menuAnchorRef = useRef<HTMLDivElement>(null);

    const renderMenuItems = () => (
        <>
            <>
                <StorybookMenuItem label="Fragment Item1" />
                <StorybookMenuItem label="Fragment Item2" />
                <Divider />
            </>
            <>
                <StorybookMenuItem label="Div Item1" />
                <StorybookMenuItem label="Div Item2" />
            </>
            <StorybookMenuItem disableCloseMenuOnClick>
                <p>Text</p>
                <Checkbox />
            </StorybookMenuItem>
            <NestedMenuItem label="Nested menu">
                <StorybookMenuItem label="NestedMenuItem Item1" />
                <NestedMenuItem label="Nested menu">
                    <StorybookMenuItem label="Nested NestedMenuItem Item1" />
                </NestedMenuItem>
            </NestedMenuItem>
            <Divider />
            <StorybookMenuItem label="Regular Item1" />
        </>
    );

    return (
        <div ref={menuAnchorRef} className="mui-menu">
            <StorybookMenu>{renderMenuItems()}</StorybookMenu>
            <StorybookMenu>
                {menuItems.map((menuItem, index) => (
                    <StorybookMenuItem key={menuItem[index]}>
                        {menuItem}
                    </StorybookMenuItem>
                ))}
            </StorybookMenu>
            <StorybookContextMenu contextMenuDivRef={menuAnchorRef}>
                {renderMenuItems()}
            </StorybookContextMenu>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque sequi
            dolor blanditiis vel quidem voluptas ratione sed quibusdam,
            reprehenderit facilis quod mollitia modi repellat odit porro
            temporibus adipisci. Error necessitatibus, dignissimos harum
            voluptate asperiores cumque quos pariatur ipsa quae rem fuga maiores
            officiis maxime laboriosam temporibus reprehenderit distinctio
            quisquam tempora? Laboriosam reprehenderit quasi laborum qui soluta
            amet provident pariatur deserunt delectus sunt voluptates libero
            animi omnis nisi alias doloribus, exercitationem vero necessitatibus
            blanditiis totam similique repellendus ex? Corporis eius, eum veniam
            explicabo ab saepe labore rerum corrupti voluptatem commodi
            recusandae dolores est atque numquam? Totam quae sequi perspiciatis,
            vel qui est autem fuga delectus, cupiditate labore dolorum id
            officiis magnam, nemo consequuntur quia provident eveniet cum iure
            unde? Aperiam vitae blanditiis dolores magnam a, sunt animi
            voluptate odio ab unde voluptas consequatur aliquid nisi iusto
            nostrum in illum velit deleniti optio commodi praesentium. Ut enim
            quisquam, debitis ipsam voluptatum reprehenderit placeat, aliquam
            dolorem, cumque obcaecati minima consequuntur velit totam laudantium
            hic? Asperiores ut iure ab quia, fuga rerum, consequatur quas
            voluptas, iusto illum harum? Vero odit magni amet, officiis
            excepturi quidem itaque neque, iure veniam cum aspernatur tempore
            commodi minima aut eius debitis nulla quisquam quibusdam voluptas
            maiores inventore repellendus optio culpa eveniet! Similique
            consequatur nulla nihil rem non aliquid sit autem quasi nemo illo
            tenetur saepe voluptate dicta beatae, porro a pariatur
            exercitationem voluptas? Iure nam doloribus esse velit voluptatem
            sequi quia fugiat temporibus, libero quos incidunt quo ipsa quas
            distinctio beatae! Eum neque eveniet natus exercitationem. Nisi
            rerum, alias, non tenetur repudiandae quam dolorem nobis aliquid
            laudantium cumque eveniet sapiente, dolores commodi iusto impedit
            cupiditate? Culpa dolorum in quisquam ducimus voluptatibus! Vel sit
            exercitationem tempora maxime voluptate dolore culpa sunt nulla
            delectus aperiam praesentium, doloribus ea alias recusandae dolorem
            ipsa quo tenetur ipsam assumenda nihil quae voluptas? Laborum culpa
            magnam repudiandae quod facilis labore ad eos dolores illum sint
            quas earum obcaecati, repellat et, reiciendis exercitationem id
            maxime sequi nemo! Eveniet odio repellat a, veniam perferendis omnis
            rem ea vel corporis placeat, deleniti illo quaerat error mollitia
            soluta iusto. Labore voluptatem eaque neque dolorem unde ipsam harum
            fuga perferendis. Voluptas repudiandae quidem illum sunt molestiae
            et itaque veniam, quo nobis, expedita soluta facere. Voluptatem quo,
            nihil dolorum sapiente quam qui ad dignissimos dicta fuga. Quam
            ipsum nulla nisi quidem modi, a voluptates, cum asperiores
            exercitationem sint corrupti, quo delectus ducimus. Molestiae cumque
            similique illum dolore dolores quam, totam quibusdam? Nobis ad quo,
            quam neque impedit dolore a omnis quisquam iure odio voluptatibus
            expedita, debitis animi. Ratione dolorum rem accusantium nesciunt?
            Delectus possimus aut ipsum commodi est similique vero natus
            reiciendis fugiat. Amet magni quasi, earum ipsa porro suscipit illo
            minus atque optio modi quod provident, velit deserunt ea doloribus
            excepturi quos, delectus aperiam voluptatum sapiente laudantium
            quibusdam odit? Nostrum itaque aliquid illo error ipsam, neque,
            quibusdam modi sapiente fugiat, nihil sint numquam? Veniam cumque
            vel laboriosam culpa velit atque at voluptate tenetur id iusto.
            Omnis accusamus nihil officia nulla delectus neque, quasi cumque
            ipsa ullam reiciendis molestias corrupti!
        </div>
    );
}
