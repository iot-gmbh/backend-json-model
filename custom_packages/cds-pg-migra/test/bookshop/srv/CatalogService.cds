using {sap.capire.bookshop as my} from '../db/schema';

service CatalogService {
    entity Books   as projection on my.Books
    entity Authors as projection on my.Authors

    @cds.redirection.target
    entity Tests   as projection on my.Genres;
}
