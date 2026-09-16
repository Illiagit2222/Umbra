use tantivy::schema::*;
use tantivy::{Index, IndexReader, IndexWriter, ReloadPolicy, Document};
use std::sync::OnceLock;

pub struct TantivyState {
    pub index: Index,
    pub reader: IndexReader,
    pub path: Field,
    pub name: Field,
    pub name_lower: Field,
    pub kind: Field,
}

pub static TANTIVY: OnceLock<TantivyState> = OnceLock::new();

pub fn init_tantivy() -> &'static TantivyState {
    TANTIVY.get_or_init(|| {
        let mut builder = Schema::builder();
        let path = builder.add_text_field("path", STORED | STRING);
        let name = builder.add_text_field("name", STORED);
        let name_lower = builder.add_text_field("name_lower", TEXT | STORED);
        let kind = builder.add_u64_field("kind", STORED | INDEXED);
        
        let schema = builder.build();
        let index = Index::create_in_ram(schema);
        let reader = index
            .reader_builder()
            .reload_policy(ReloadPolicy::OnCommit)
            .try_into()
            .unwrap();
            
        TantivyState { index, reader, path, name, name_lower, kind }
    })
}

pub fn get_writer() -> IndexWriter {
    let state = init_tantivy();
    state.index.writer(50_000_000).unwrap()
}
